import { Unitdata } from "./unitdata";

let MOCKCLASSDATA: Array<Object> = [
        {
          "classname": "",
          "defaultspriteforrace": null,
          "viableraces": "0,1,2,3,4,5,6",
          "isunique": false
        },
        {
          "classname": "Parivir",
          "defaultspriteforrace": null,
          "viableraces": "0",
          "isunique": false
        },
        {
          "classname": "Blue Mage",
          "defaultspriteforrace": null,
          "viableraces": "0",
          "isunique": false
        },
        {
          "classname": "Ninja",
          "defaultspriteforrace": null,
          "viableraces": "0",
          "isunique": false
        },
        {
          "classname": "Paladin",
          "defaultspriteforrace": null,
          "viableraces": "0",
          "isunique": false
        },
        {
          "classname": "Fighter",
          "defaultspriteforrace": null,
          "viableraces": "0",
          "isunique": false
        },
        {
          "classname": "Soldier",
          "defaultspriteforrace": 0,
          "viableraces": "0",
          "isunique": false
        },
        {
          "classname": "White Mage",
          "defaultspriteforrace": null,
          "viableraces": "0,2,3",
          "isunique": false
        },
        {
          "classname": "Black Mage",
          "defaultspriteforrace": null,
          "viableraces": "0,2,4",
          "isunique": false
        },
        {
          "classname": "Thief",
          "defaultspriteforrace": null,
          "viableraces": "0,4",
          "isunique": false
        },
        {
          "classname": "White Monk",
          "defaultspriteforrace": 1,
          "viableraces": "1",
          "isunique": false
        },
        {
          "classname": "Master Monk",
          "defaultspriteforrace": null,
          "viableraces": "1",
          "isunique": false
        },
        {
          "classname": "Beastmaster",
          "defaultspriteforrace": 2,
          "viableraces": "2",
          "isunique": false
        },
        
        {
            "classname": "Fencer",
            "defaultspriteforrace": 3,
            "viableraces": "3",
            "isunique": false
        }, 
        {
            "classname": "Animist",
            "defaultspriteforrace": 4,
            "viableraces": "4",
            "isunique": false
        },
        {
            "classname": "Raptor",
            "defaultspriteforrace": 5,
            "viableraces": "5",
            "isunique": false
        },
        {
            "classname": "Ranger",
            "defaultspriteforrace": 6,
            "viableraces": "6",
            "isunique": false
        },
      ];

export { MOCKCLASSDATA };

let MOCKRABILITYDATA: Array<Object> = [
    {"abilityname": "Blur", "isreactive": true, "viableraces": "1,4"}, 
    {"abilityname": "Counter", "isreactive": true, "viableraces": "0,1,4,5,6"}, 
    {"abilityname": "Magick Counter", "isreactive": true, "viableraces": "0,1,2,4,5"}
];

export { MOCKRABILITYDATA };

let MOCKPABILITYDATA: Array<Object> = [
    {"abilityname": "Item Lore", "isreactive": false, "viableraces": "2,6"}, 
    {"abilityname": "Shieldbearer", "isreactive": false, "viableraces": "0,1,4,5,6"},
    {"abilityname": "Dual Wield", "isreactive": false, "viableraces": "0"}
]

export { MOCKPABILITYDATA };

export class MockPartyService {
    CLASSDATA = MOCKCLASSDATA;
    RABILITYDATA = MOCKRABILITYDATA;
    PABILITYDATA = MOCKPABILITYDATA;
    readonly RACENUMS = [-1, 0, 1, 2, 3, 4, 5, 6];
    readonly RACENAMES = ["Hume", "Bangaa", "Nu Mou", "Viera", "Moogle", "Gria", "Seeq"];
    defaultsprites = ['Soldier', 'White Monk', 'Beastmaster', 'Fencer', 'Animist', 'Raptor', 'Ranger'];
    
    partyarray: Unitdata[] = [];
    private partyarraysub = "";
    partyarraysub$ = "";
    private idcount: number = 0;
    isloaded = false;
    loaderror = false;


    initializeAPI() {
        console.log("API calls faked");
        console.log("CHECKDATa", this.CLASSDATA, this.RABILITYDATA, this.PABILITYDATA);
        this.isloaded = true;
    }

    getPartyMemberById(id: number)  { console.log("MOCKED"); }
    newPartyMember()  { console.log("MOCKED"); }
    updatePartyMember (id: number, vartochange: string, newvalue: string)  { console.log("MOCKED"); }
    deletePartyMember(id: number) { console.log("MOCKED"); }
    getXClassInfo(classname: string) { console.log("MOCKED"); }
    getClassViableRaces(classname: string)  { console.log("MOCKED"); }
    getAbilityViableRaces(abilityname: string, reactive: boolean) { console.log("MOCKED"); }
    getDefaultSpriteForRace(race: number)  { console.log("MOCKED"); }
    initDefaultRaceSprites() { console.log("MOCKED"); }
};

let SMockPartyService = jasmine.createSpyObj('PartyService', ['', 'initializeAPI'],
{   
    CLASSDATA: MOCKCLASSDATA, 
    RABILITYDATA: MOCKRABILITYDATA,
    PABILITYDATA: MOCKPABILITYDATA,
    defaultsprites: ['Soldier', 'White Monk', 'Beastmaster', 'Fencer', 'Animist', 'Raptor', 'Ranger'],
    RACENUMS: [-1, 0, 1, 2, 3, 4, 5, 6],
    RACENAMES: ["Hume", "Bangaa", "Nu Mou", "Viera", "Moogle", "Gria", "Seeq"],

});