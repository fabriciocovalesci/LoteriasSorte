

import React, { useState } from 'react'
import { View, Text, Dimensions, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import moment from 'moment';
import "moment/locale/pt-br"
import { EstatisMega } from '../../services/estatisticas';
import { MyBarChart, MyBarChartAtraso, BarChartSomaPercent } from '../../Components/BarChart';
import { DataTable, Divider, Colors, Button, Title, IconButton, Modal, Card, Paragraph, Checkbox } from 'react-native-paper';
import * as Progress from 'react-native-progress';

import { Col, Row, Grid } from "react-native-easy-grid";

import {Picker} from '@react-native-picker/picker';

import { ScrollView } from 'react-native-gesture-handler';

import { GraficoBarYear, GraficoBarMesAno } from '../../Components/Graficos';

import { ModalDate } from '../../Components/ModalDate';

moment.locale('pt-br');

const CircleNumber = (props) => {
    return (
        <View style={styles.circleMega}>
            <Text style={{ color: "#fff", alignSelf: "center", fontWeight: "bold" }}>{props.number}</Text>
        </View>
    )
}


const dataYear = Array.from({ length: 27 }, (v, k) => k + 1996).reverse()

export default function EstatisticaMega() {

    const [selected, setStateBtn] = React.useState(0)

    const [tableMega, setTableMega] = React.useState([])

    const [tableMegaAnalise, setTableMegaAnalise] = React.useState([])

    const [megaChart, setMegaChart] = React.useState([])

    const [megaChartSeq, setMegaChartSeq] = React.useState([])

    const [megaChartAtraso, setMegaChartAtraso] = React.useState([])

    const [megaSomaParImpar, setMegaSomaParImpar] = React.useState([])

    const [megaSomaPercent, setMegaSomaPercent] = React.useState()
    const [allDataMega, SetAlldataMega] = React.useState([]);
    const [filterDataMesAno, setFilterDataMesAno] = React.useState([]);
    const [filterDataAno, setFilterDataAno] = React.useState([]);
    const [mesAno, setMesAno] = React.useState('');

    const [countDezByAno, setCountDezenasByAno] = React.useState([]);
    const [countDezByMesAno, setCountDezenasByMesAno] = React.useState([]);

    const [selectGroup, setSelectGroup] = React.useState(0);
    const [visible, setVisible] = React.useState(false);

    const [checked, setChecked] = React.useState(true);
    const [checkedDetail, setCheckedDetail] = React.useState(false);
    const [CheckedFreqMA, setCheckedFreqMA] = React.useState(false);
    const [CheckedFreqA, setCheckedFreqA] = React.useState(false);

    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);

    function convertToInt(array){
        let arr = array.map(i=>Number(i));
        return arr;
     }
    
    function countParImpar1(arr){
        let par = 0;
        let impar = 0;
        arr.forEach(element => {
            if(element%2===0) par++
            else if(element%2!==0) impar++
        });
        return {
            par, impar
        }
    }
    
    const isPrime = (num) => {
        for (let i = 2; i < num; i++)
          if (num % i === 0) {
            return false;
          }
        return num > 1;
      }
    
    function findPrime(array){
          let primos = []
          array.forEach(element => {
            if(isPrime(parseInt(element))){
                primos.push(element)
            }
        })
        return primos
      }

      function sortObject(obj) {
        return  Object.keys(obj)
          .sort((c,b) => {
              return obj[b]-obj[c]
          })
          .reduce((acc, cur) => {
              let o = {}
              o[cur] = obj[cur]
              acc.push(o)
              return acc
          } , [])
      }
    
    const filterdataMesAno = (mes, ano) => {
        let filter = []
        allDataMega.filter((jogos) => {
            if(moment(jogos.data, "DD/MM/YYYY").month() == mes && moment(jogos.data, "DD/MM/YYYY").year() == ano){
                let data = {
                    'data': jogos.data,
                    'concurso': jogos.concurso,
                    'dezenas': convertToInt(jogos.dezenas),
                    'soma': convertToInt(jogos.dezenas).reduce((total, numero) => total + numero, 0),
                    'pares': countParImpar1(convertToInt(jogos.dezenas)).par,
                    'impar': countParImpar1(convertToInt(jogos.dezenas)).impar,
                    'primos': findPrime(jogos.dezenas)
                }
                filter.push(data)
            }
        })
        return filter;
    }


    const filterdataAno = (ano) => {
        let filterYear = []
        allDataMega.filter((jogos) => {
            if(moment(jogos.data, "DD/MM/YYYY").year() == ano){
                let data = {
                    'data': jogos.data,
                    'concurso': jogos.concurso,
                    'dezenas': convertToInt(jogos.dezenas),
                    'soma': convertToInt(jogos.dezenas).reduce((total, numero) => total + numero, 0),
                    'pares': countParImpar1(convertToInt(jogos.dezenas)).par,
                    'impar': countParImpar1(convertToInt(jogos.dezenas)).impar,
                    'primos': findPrime(jogos.dezenas)
                }
                filterYear.push(data)
            }
        })
        return filterYear;
    }

    function countDezenasByAno(ano){
        const counts = {};
        filterdataAno(ano).forEach((elem, index) => {
            elem.dezenas.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });
        })
        return counts
    }
    
    function countDezenasByMesAno(mes, ano){
        const counts = {};
        filterdataMesAno(mes, ano).forEach((elem, index) => {
            elem.dezenas.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });
        })
        return counts
    }
    

    function getDate(date){
        setMesAno(date)
        let mes = parseInt(date.substr(5, 7))-1
        let ano = parseInt(date.substr(0, 4))
        setFilterDataMesAno(filterdataMesAno(mes, ano))
        setCountDezenasByMesAno(sortObject(countDezenasByMesAno(mes, ano)))
        setSelectedYear('')
        setSelectGroup(1)
    }

    function filterDateYear(){
        setFilterDataAno(filterdataAno(selectedYear))
        setCountDezenasByAno(sortObject(countDezenasByAno(selectedYear)))
        setSelectGroup(2)
    }

    React.useEffect(() => {
        EstatisMega().then((value) => {
            SetAlldataMega(value.allMega)
            setTableMega(value.ocorrencias);
            setMegaChart(value.ocorrencias.slice(0, 10));
            setTableMegaAnalise(value.estatisAtrasoSeq)
            setMegaChartAtraso(value.estatisAtrasoSeq.slice(value.estatisAtrasoSeq.length - 10, value.estatisAtrasoSeq.length))
            setMegaSomaParImpar(value.somaParImpar.slice(value.somaParImpar.length - 100, value.somaParImpar.length))
            setMegaSomaPercent(value.percentSoma)
        });
    }, [])


    const [selectedLanguage, setSelectedLanguage] = React.useState('ocorrencias');
    const pickerRef = React.useRef();

    function open() {
    pickerRef.current.focus();
    }

    function close() {
    pickerRef.current.blur();
    } 

    const [selectedYear, setSelectedYear] = React.useState('');
    const pickerRefYear = React.useRef();

    function openYear() {
    pickerRefYear.current.focus();
    }

    function closeYear() {
    pickerRefYear.current.blur();
    }

    return (
        <>
            <View style={{ marginBottom: 0, marginTop: 10, marginLeft: 5, marginRight: 5 }}>
                <Picker
                ref={pickerRef}
                mode="dialog"
                selectedValue={selectedLanguage}
                onValueChange={(itemValue, itemIndex) =>
                    setSelectedLanguage(itemValue)
                }>
                <Picker.Item label="Ocorrências" value="ocorrencias" />
                <Picker.Item label="Atrasos" value="atrasos" />
                <Picker.Item label="Sequências" value="sequencias" />
                <Picker.Item label="Combinações Par - Impar" value="par-impar" />
                <Picker.Item label="Agrupamentos por datas" value="agrupamentos" />
                </Picker>
            </View>
 
            <ScrollView>
                 {selectedLanguage === 'ocorrencias' ?
                    <>
                    {
                        megaChart.length === 0 && tableMega.length === 0 ?
                        <View style={{ flex: 1, height: Dimensions.get('screen').height / 2, justifyContent: "center", alignContent: "center" }}>
                            <Text style={{ color: Colors.black, fontWeight: "bold", textAlign: "center" }}>Carregando dados ...</Text>
                            <ActivityIndicator size="large" color="#0000ff" />
                        </View>
                        :
                        <>
                        <View>
                            <MyBarChart dezenas={megaChart} tituloBar="Maior Ocorrências" subtituloBar="10 dezenas Mais sorteadas" />
                        </View>
                        <DataTable>
                            <DataTable.Header style={{}}>
                                <DataTable.Title >Dezena</DataTable.Title>
                                <DataTable.Title >Ocorrências</DataTable.Title>
                            </DataTable.Header>
                            <ScrollView>
                                {tableMega.map((elem, index) =>
                                    <DataTable.Row key={index}>
                                        <DataTable.Cell ><CircleNumber number={elem[0]}/></DataTable.Cell>
                                        <DataTable.Cell >{elem[1]}</DataTable.Cell>
                                    </DataTable.Row>
                                )}
                            </ScrollView>
                        </DataTable>
                        </>
                    }   
                        
                    </>
                    :  selectedLanguage === 'atrasos'  ?
                    <>
                        <View>
                            <MyBarChartAtraso dezenas={megaChartAtraso} tituloBar="Maiores Atrasos" subtituloBar="10 dezenas Mais atrasadas" />
                        </View>
                        <DataTable>
                            <DataTable.Header style={{}}>
                                <DataTable.Title >Dezena</DataTable.Title>
                                <DataTable.Title >Atraso</DataTable.Title>
                                <DataTable.Title >Max Atraso</DataTable.Title>
                                <DataTable.Title >Média Atraso</DataTable.Title>
                            </DataTable.Header>
                            <ScrollView>
                                {tableMegaAnalise.map((elem, index) =>
                                    <DataTable.Row key={index + elem.dezena}>
                                        <DataTable.Cell ><CircleNumber number={elem.dezena}/></DataTable.Cell>
                                        <DataTable.Cell >{elem.atraso}</DataTable.Cell>
                                        <DataTable.Cell >{elem.maxAtraso}</DataTable.Cell>
                                        <DataTable.Cell >{elem.mediaAtraso} %</DataTable.Cell>
                                    </DataTable.Row>
                                )}
                            </ScrollView>
                        </DataTable>
                    </>
                    : selectedLanguage === 'sequencias'  ? 
                    <>
                        <View>
                            {/* <MyBarChartAtraso dezenas={megaChartAtraso} tituloBar="Maiores Atrasos" subtituloBar="10 dezenas Mais atrasadas" /> */}
                        </View>
                        <DataTable>
                            <DataTable.Header style={{}}>
                                <DataTable.Title >Dezena</DataTable.Title>
                                <DataTable.Title >Sequência</DataTable.Title>
                                <DataTable.Title >Max Seq</DataTable.Title>
                                <DataTable.Title >Média Seq</DataTable.Title>
                            </DataTable.Header>
                            <ScrollView>
                                {tableMegaAnalise.map((elem, index) =>
                                    <DataTable.Row key={index + elem.dezena}>
                                        <DataTable.Cell ><CircleNumber number={elem.dezena}/></DataTable.Cell>
                                        <DataTable.Cell >{elem.sequencia}</DataTable.Cell>
                                        <DataTable.Cell >{elem.maxSequencia}</DataTable.Cell>
                                        <DataTable.Cell >{elem.mediaSequencia} %</DataTable.Cell>
                                    </DataTable.Row>
                                )}
                            </ScrollView>
                        </DataTable>
                    </>
                    : selectedLanguage === 'par-impar'  ?
                    <>
                    <View style={{  }}>
                            <Text style={{ textAlign: "center", marginBottom: 10, fontWeight: "bold" }}>Combinações de Dezenas Pares e Ímpares</Text>
                        </View>
                        <View style={{ alignSelf: "center", marginTop: 0 }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                                <Text>3 Pares e 3 Ímpares: {megaSomaPercent.equal.jogos} jogos</Text>
                                <Text>{megaSomaPercent.equal.porcentagem} %</Text>
                            </View>
                            <Progress.Bar progress={megaSomaPercent.equal.porcentagem / 100} color='red' height={10} width={Dimensions.get('screen').width - 40} />
                            <Divider style={{marginBottom: 10}}/>
                            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                                <Text>4 Pares e 2 Ímpares: {megaSomaPercent.FourPTwoI.jogos} jogos</Text>
                                <Text>{megaSomaPercent.FourPTwoI.porcentagem} %</Text>
                            </View>
                            <Progress.Bar progress={megaSomaPercent.FourPTwoI.porcentagem / 100} color='red' height={10} width={Dimensions.get('screen').width - 40} />
                            <Divider style={{marginBottom: 10}}/>
                            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                                <Text>2 Pares e 4 Ímpares: {megaSomaPercent.FourITwoP.jogos} jogos</Text>
                                <Text>{megaSomaPercent.FourITwoP.porcentagem} %</Text>
                            </View>
                            <Progress.Bar progress={megaSomaPercent.FourITwoP.porcentagem/100} color='red' height={10} width={Dimensions.get('screen').width - 40} />
                            <Divider style={{marginBottom: 10}}/>
                            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                                <Text>5 Pares e 1 Ímpares: {megaSomaPercent.FivePOneI.jogos} jogos</Text>
                                <Text>{megaSomaPercent.FivePOneI.porcentagem} %</Text>
                            </View>
                            <Progress.Bar progress={megaSomaPercent.FivePOneI.porcentagem/100} color='red' height={10} width={Dimensions.get('screen').width - 40} />
                            <Divider style={{marginBottom: 10}}/>
                            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                                <Text>1 Pares e 5 Ímpares: {megaSomaPercent.FiveIOneP.jogos} jogos</Text>
                                <Text>{megaSomaPercent.FiveIOneP.porcentagem} %</Text>
                            </View>
                            <Progress.Bar progress={megaSomaPercent.FiveIOneP.porcentagem/100} color='red' height={10} width={Dimensions.get('screen').width - 40} />
                            <Divider style={{marginBottom: 10}}/>
                            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                                <Text>0 Pares e 6 Ímpares: {megaSomaPercent.SixIZeroP.jogos} jogos</Text>
                                <Text>{megaSomaPercent.SixIZeroP.porcentagem} %</Text>
                            </View>
                            <Progress.Bar progress={megaSomaPercent.SixIZeroP.porcentagem/100} color='red' height={10} width={Dimensions.get('screen').width - 40} />
                            <Divider style={{marginBottom: 10}}/>
                            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                                <Text>6 Pares e 0 Ímpares: {megaSomaPercent.SixPZeroI.jogos} jogos</Text>
                                <Text>{megaSomaPercent.SixPZeroI.porcentagem} %</Text>
                            </View>
                            <Progress.Bar progress={megaSomaPercent.SixPZeroI.porcentagem/100} color='red' height={10} width={Dimensions.get('screen').width - 40} />
                        </View>
                        <View style={{marginTop: 15, marginBottom: 5}}>
                        <Text style={{ textAlign: "center", marginBottom: 10, fontWeight: "bold" }}>Tabela dos Números Pares e Ímpares</Text>
                        </View>
                        <DataTable>
                            <DataTable.Header style={{}}>
                                <DataTable.Title >Concurso</DataTable.Title>
                                <DataTable.Title numeric>Impares</DataTable.Title>
                                <DataTable.Title numeric>Pares</DataTable.Title>
                                <DataTable.Title numeric>Soma</DataTable.Title>
                            </DataTable.Header>
                            <ScrollView>
                                {megaSomaParImpar.reverse().map((elem, index) =>
                                    <DataTable.Row key={index}>
                                        <DataTable.Cell ><Text style={{ fontWeight: "bold" }}>{elem.concurso}</Text></DataTable.Cell>
                                        <DataTable.Cell numeric>{elem.impar}</DataTable.Cell>
                                        <DataTable.Cell numeric>{elem.par}</DataTable.Cell>
                                        <DataTable.Cell numeric>{elem.soma}</DataTable.Cell>
                                    </DataTable.Row>
                                )}
                            </ScrollView>
                        </DataTable>
                    </>
                    : selectedLanguage === 'agrupamentos'  ?
                    <View>
                        <ModalDate getdate={(date) => getDate(date)} visible={visible} hideModal={hideModal}></ModalDate>
                        <View style={{ flexDirection: "row", justifyContent: "space-around", alignContent: "center" }}>
                        <Button mode='outlined' style={{ borderColor: "blue", margin: 5 }} onPress={showModal}>Mês/Ano</Button>
                        
                        <Picker
                        style={{ width: "50%", borderColor: "blue", borderWidth: 1  }}
                        ref={pickerRefYear}
                        mode="dropdown"
                        selectedValue={selectedYear}
                        onBlur={filterDateYear}
                        onValueChange={(itemValue, itemIndex) =>
                            setSelectedYear(itemValue)
                        }>
                            <Picker.Item label="Selecione ano" />
                        {
                            dataYear.map((year) => 
                            <Picker.Item key={year} label={"Ano " + year} value={year} />
                            )
                        }
                        </Picker>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                            <Checkbox.Item
                                label='Versão Compacta'
                                style={{ margin: 0 }}
                                status={checked ? 'checked' : 'unchecked'}
                                onPress={() => {
                                    setChecked(!checked);
                                    setCheckedDetail(false);
                                    setCheckedFreqMA(false)
                                    setCheckedFreqA(false)
                                }}
                            />
                            <Checkbox.Item
                                label='Versão Detalhada'
                                status={checkedDetail ? 'checked' : 'unchecked'}
                                onPress={() => {
                                    setCheckedDetail(!checkedDetail);
                                    setChecked(false);
                                    setCheckedFreqMA(false)
                                    setCheckedFreqA(false)
                                }}
                            />
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 5, marginLeft: 5 }}>
                            <Checkbox.Item
                                label='Frequência Mês/Ano'
                                status={CheckedFreqMA ? 'checked' : 'unchecked'}
                                onPress={() => {
                                    setCheckedFreqMA(!CheckedFreqMA);
                                    setChecked(false);
                                    setCheckedDetail(false)
                                    setCheckedFreqA(false)
                                }}
                            />
                            <Checkbox.Item
                                label='Frequência por ano'
                                status={CheckedFreqA ? 'checked' : 'unchecked'}
                                onPress={() => {
                                    setCheckedFreqA(!CheckedFreqA);
                                    setCheckedFreqMA(false)
                                    setChecked(false);
                                    setCheckedDetail(false)
                                }}
                            />
                        </View>

                        {
                            selectGroup === 0 ?
                            <>
                            <Text style={{ textAlign: "center", margin: 10 }}>Selecione uma opção de data para consulta</Text>
                            </>
                            : selectGroup === 1 ?
                            <>
                            {
                                checked ?
                            <DataTable>
                            <Text style={{ fontWeight: "bold", marginLeft: 15 }}>Mês - Ano: {moment.months(mesAno.substr(5, 7) - 1)} de {mesAno.substr(0, 4)}</Text>
                            <DataTable.Header style={{}}>
                                <DataTable.Title >Concurso</DataTable.Title>
                                <DataTable.Title numeric>Par</DataTable.Title>
                                <DataTable.Title numeric>Impar</DataTable.Title>
                                <DataTable.Title numeric>Soma</DataTable.Title>
                                <DataTable.Title numeric>Primos</DataTable.Title>
                            </DataTable.Header>
                            <ScrollView>
                                {filterDataMesAno.map((elem, index) =>
                                    <DataTable.Row key={index}>
                                        <DataTable.Cell ><Text style={{ fontWeight: "bold" }}>{elem.concurso}</Text></DataTable.Cell>
                                        <DataTable.Cell numeric>{elem.pares}</DataTable.Cell>
                                        <DataTable.Cell numeric>{elem.impar}</DataTable.Cell>
                                        <DataTable.Cell numeric>{elem.soma}</DataTable.Cell>
                                        <DataTable.Cell numeric>{elem.primos.length}</DataTable.Cell>
                                    </DataTable.Row>
                                )}
                            </ScrollView>
                            </DataTable>
                        : checkedDetail ?
                            <View>
                            <ScrollView>
                                    {filterDataMesAno.map((elem, index) =>
                                        <View key={index} style={styles.cardShadow}>
                                            <Grid style={{ justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                                <Col>
                                                    <Text style={{ fontWeight: "bold" }}>Concurso {elem.concurso}</Text>
                                                </Col>
                                                <Col>
                                                    <Text>Par</Text>
                                                    <Row><Text>{elem.pares}</Text></Row>
                                                </Col>
                                                <Col>
                                                    <Text>Impar</Text>
                                                    <Row><Text>{elem.impar}</Text></Row>
                                                </Col>
                                                <Col>
                                                    <Text>Soma</Text>
                                                    <Row><Text>{elem.soma}</Text></Row>
                                                </Col>
                                            </Grid>
                                            <View style={{ marginTop: 10, justifyContent: "center", alignContent: "center" }}>
                                                <Grid>
                                                    <Row><Text style={{ fontWeight: "bold" }}>Dezenas Sorteadas - {elem.data}</Text></Row>
                                                    <Col style={{ flexDirection: "row", flexWrap: "wrap" }}>
                                                        {
                                                            elem.dezenas.map(dezena => <CircleNumber key={dezena} number={dezena}/>)
                                                        }
                                                    </Col>
                                                    <Row><Text>Números Primos</Text></Row>
                                                    <Col style={{ flexDirection: "row", flexWrap: "wrap" }}>
                                                        {
                                                            elem.primos.map(primo => <CircleNumber key={primo} number={primo}/>)
                                                        }
                                                    </Col>
                                                </Grid>
                                            </View>
                                        </View>
                                    )}
                                </ScrollView>
                            </View>
                        : CheckedFreqMA ?
                        <View>
                            <GraficoBarMesAno dezenas={countDezByMesAno.slice(0,10)} data={mesAno} />
                        <DataTable>
                        <Text style={{ padding: 5, fontWeight: "bold" }}>Quantidade de vezes que a dezena foi sorteada no mês {moment.months(mesAno.substr(5, 7) - 1)} de {mesAno.substr(0, 4)}</Text>
                        <DataTable.Header style={{}}>
                            <DataTable.Title >Dezena</DataTable.Title>
                            <DataTable.Title >Frequência</DataTable.Title>
                        </DataTable.Header>
                        <ScrollView>
                            {countDezByMesAno.map((elem, index) =>
                                <DataTable.Row key={index}>
                                     <DataTable.Cell ><CircleNumber key={index} number={Object.keys(elem)[0]}/></DataTable.Cell>
                                     <DataTable.Cell >{Object.values(elem)[0]}</DataTable.Cell>
                                 </DataTable.Row>
                            )}
                        </ScrollView>
                        </DataTable>
                    </View> 
                        : null               
                            }
                            </>
                        : selectGroup === 2 ?
                        <>
                        {
                            checked ? 
                            <DataTable>
                            <Text style={{ fontWeight: "bold", marginLeft: 15 }}>Ano: {selectedYear}</Text>
                            <DataTable.Header style={{}}>
                                <DataTable.Title >Concurso</DataTable.Title>
                                <DataTable.Title numeric>Par</DataTable.Title>
                                <DataTable.Title numeric>Impar</DataTable.Title>
                                <DataTable.Title numeric>Soma</DataTable.Title>
                                <DataTable.Title numeric>Primos</DataTable.Title>
                            </DataTable.Header>
                            <ScrollView>
                                {filterDataAno.map((elem, index) =>
                                    <DataTable.Row key={index}>
                                        <DataTable.Cell ><Text style={{ fontWeight: "bold" }}>{elem.concurso}</Text></DataTable.Cell>
                                        <DataTable.Cell numeric>{elem.pares}</DataTable.Cell>
                                        <DataTable.Cell numeric>{elem.impar}</DataTable.Cell>
                                        <DataTable.Cell numeric>{elem.soma}</DataTable.Cell>
                                        <DataTable.Cell numeric>{elem.primos.length}</DataTable.Cell>
                                    </DataTable.Row>
                                )}
                            </ScrollView>
                            </DataTable>
                            : checkedDetail ?
                            <View>
                            <ScrollView>
                                    {filterDataAno.map((elem, index) =>
                                        <View key={index} style={styles.cardShadow}>
                                            <Grid style={{ justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                                <Col>
                                                    <Text style={{ fontWeight: "bold" }}>Concurso {elem.concurso}</Text>
                                                </Col>
                                                <Col>
                                                    <Text>Par</Text>
                                                    <Row><Text>{elem.pares}</Text></Row>
                                                </Col>
                                                <Col>
                                                    <Text>Impar</Text>
                                                    <Row><Text>{elem.impar}</Text></Row>
                                                </Col>
                                                <Col>
                                                    <Text>Soma</Text>
                                                    <Row><Text>{elem.soma}</Text></Row>
                                                </Col>
                                            </Grid>
                                            <View style={{ marginTop: 10, justifyContent: "center", alignContent: "center" }}>
                                                <Grid>
                                                    <Row><Text style={{ fontWeight: "bold" }}>Dezenas Sorteadas - {elem.data}</Text></Row>
                                                    <Col style={{ flexDirection: "row", flexWrap: "wrap" }}>
                                                        {
                                                            elem.dezenas.map(dezena => <CircleNumber key={dezena} number={dezena}/>)
                                                        }
                                                    </Col>
                                                    <Row><Text>Números Primos</Text></Row>
                                                    <Col style={{ flexDirection: "row", flexWrap: "wrap" }}>
                                                        {
                                                            elem.primos.map(primo => <CircleNumber key={primo} number={primo}/>)
                                                        }
                                                    </Col>
                                                </Grid>
                                            </View>
                                        </View>
                                    )}
                                </ScrollView>
                            </View>
                            : CheckedFreqA ?
                            <View>
                                <GraficoBarYear dezenas={countDezByAno.slice(0,10)} ano={selectedYear}/>
                                <DataTable>
                                <Text style={{ padding: 5, fontWeight: "bold" }}>Quantidade de vezes que a dezena foi sorteada no ano de {selectedYear}</Text>
                                <DataTable.Header style={{}}>
                                    <DataTable.Title >Dezena</DataTable.Title>
                                    <DataTable.Title >Frequência</DataTable.Title>
                                </DataTable.Header>
                                <ScrollView>
                                    {countDezByAno.map((elem, index) =>
                                        <DataTable.Row key={index}>
                                             <DataTable.Cell ><CircleNumber key={index} number={Object.keys(elem)[0]}/></DataTable.Cell>
                                             <DataTable.Cell >{Object.values(elem)[0]}</DataTable.Cell>
                                         </DataTable.Row>
                                    )}
                                </ScrollView>
                                </DataTable>
                            </View> 
                            : null
                        }
                        </>
                    : null
                    }
                        
                    </View>
                    : null}
            </ScrollView>
        </>
    )
}


export const styles = StyleSheet.create({
    circleMega: {
        width: 30,
        height: 30,
        borderRadius: 30 / 2,
        backgroundColor: '#209869' ,
        justifyContent: "center",
        alignItems: "center",
        padding: 5,
        margin: 2
    },
      chart: {
        flex: 1
      },
      cardShadow :{
        padding: 20,
        margin: 5,
        backgroundColor: Colors.white, 
        borderRadius: 10, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.9,
        shadowRadius: 2,  
        elevation: 9
    },
      containerCarousel: {
        backgroundColor: '#fff', 
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10
      },
      dropdown: {
        height: 50,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
      },
      icon: {
        marginRight: 5,
      },
      label: {
        position: 'absolute',
        backgroundColor: 'white',
        left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 14,
      },
      placeholderStyle: {
        fontSize: 16,
      },
      selectedTextStyle: {
        fontSize: 16,
      },
      iconStyle: {
        width: 20,
        height: 20,
      },
      inputSearchStyle: {
        height: 40,
        fontSize: 16,
      },
});

