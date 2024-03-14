export interface Unitdata {
    unitid: number,
    sortorder: number,

    //this collection is the 'unit data':
    unitname: string,
    race: number,
    impliedrace: number[];
    primaryclass: string,
    secondaryclass: string,
    rability: string,
    pability: string,
    changetracker: number
}
