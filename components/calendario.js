import {Component} from 'react';
import {Text, View, TouchableOpacity, StyleSheet} from 'react-native';
// import Text from "react-native-web/src/exports/Text";
import * as React from 'react';

export default class MyCalendar extends Component {
    state = {
        activeDate: new Date()
    };
    months = ["Enero", "Febrero", "Marzo", "Abril",
        "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre",
        "Noviembre", "Diciembre"];

    weekDays = [
        "Dom", "Lun", "Mar", "Mier", "Jue", "Vie", "Sab"
    ];
    nDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    /*A esta funcion siempre le paso el dia seleccionado, el mes seleccionado y los datos obtenidos
    por callback*/
    _onPress = (item, datos) => {
        if (!isNaN(item)) { //Chequear que sea un numero
            if (item > 0)
                return this.props.cbOnPressDia(item, (this.state.activeDate.getMonth() + 1), this.state.activeDate.getFullYear(), datos)
        }
        return null;

    };

    changeMonth = (n) => {
        this.setState(() => {
            this.state.activeDate.setMonth(
                this.state.activeDate.getMonth() + n
            )
            return this.state;
        });
    }

    generateMatrix() {
        let matrix = [];
        // Create header
        matrix[0] = this.weekDays;

        let year = this.state.activeDate.getFullYear();
        let month = this.state.activeDate.getMonth();

        let firstDay = new Date(year, month, 1).getDay();

        let maxDays = this.nDays[month];
        if (month == 1) { // February
            if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
                maxDays += 1;
            }
        }

        let counter = 1;
        for (let row = 1; row < 7; row++) {
            matrix[row] = [];
            for (let col = 0; col < 7; col++) {
                matrix[row][col] = -1;
                if (row == 1 && col >= firstDay) {
                    // Fill in rows only after the first day of the month
                    matrix[row][col] = counter++;
                } else if (row > 1 && counter <= maxDays) {
                    // Fill in rows only if the counter's not greater than
                    // the number of days in the month
                    matrix[row][col] = counter++;
                }
            }
        }


        return matrix;
    }

    determinarColor(arr, item) {
        let color = '#000';
        if (!isNaN(item)) { //Chequear que sea un numero
            if (item > 0)
                color = this.props.cbColorDia(item, (this.state.activeDate.getMonth() + 1), arr);
        }

        return color;
    }

    render() {
        let matrix = this.generateMatrix();
        let i = 0;
        let j = 0;
        let rows = [];
        rows = matrix.map((row, rowIndex) => {
            i++;
            let rowItems = row.map((item, colIndex) => {
                j++;
                return (
                    <Text
                        style={{
                            flex: 1,
                            height: 18,
                            textAlign: 'center',
                            // Highlight header
                            backgroundColor: rowIndex == 0 ? '#ddd' : '#fff',
                            // Highlight Sundays
                            color: this.determinarColor(this.props.cbDatos, item),
                            // Highlight current date
                            // fontWeight: item == this.state.activeDate.getDate()
                            //     ? 'bold' : ''
                        }}
                        onPress={() => this._onPress(item, this.props.cbDatos)}
                        key={`b${j}`}
                    >
                        {item != -1 ? item : ''}
                    </Text>
                );
            });
            return (

                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        padding: 5,
                        justifyContent: 'space-around',
                        alignItems: 'center',
                    }}>

                    {rowItems}
                    {/*key={`a${i}`}*/}

                </View>

            );
        });
        return (
            <>
                <View style={styles.cabecera}>
                    <TouchableOpacity
                        style={styles.botonRetroceder}
                        onPress={() => this.changeMonth(-1)}>
                        <Text style={styles.botonesCabecera}>{`<<ant`}</Text>
                    </TouchableOpacity>

                    <Text
                        style={{
                            fontWeight: 'bold',
                            fontSize: 18
                        }}>
                        &nbsp;
                        &nbsp;
                        {this.months[this.state.activeDate.getMonth()]} &nbsp;
                        {this.state.activeDate.getFullYear()}
                        &nbsp;
                        &nbsp;
                    </Text>

                    <TouchableOpacity
                        style={styles.botonAvanzar}
                        onPress={() => this.changeMonth(+1)}>
                        <Text style={styles.botonesCabecera}>{`sig>>`}</Text>
                    </TouchableOpacity>
                </View>


                {rows}
                <Text style={{textAlign: 'center'}}>
                    <Text style={{color: this.props.colorPie, fontWeight: 'bold'}}>==</Text> {this.props.pie}
                </Text>
            </>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    subContainer: {
        marginTop: 30,
    },
    cabecera: {
        flexDirection: 'row', //Un objeto al lado del otro
        justifyContent: 'center',
    },
    botonesCabecera: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#477fc4',
    },
    botonRetroceder: {
        height: 25,
        borderRadius: 1,
    },
    botonAvanzar: {
        height: 25,
        borderRadius: 1,
    }
});
