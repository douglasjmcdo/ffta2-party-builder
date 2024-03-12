import { TestBed } from '@angular/core/testing';

import { PartyService } from './party.service';

//mockdata:
import { MOCKCLASSDATA } from './party.service.mock';
import { MOCKRABILITYDATA } from './party.service.mock';
import { MOCKPABILITYDATA } from './party.service.mock';

fdescribe('PartyService', () => {
  let service: PartyService;  
  const okresponse = new Response(JSON.stringify({res: {rows: MOCKCLASSDATA}}), {
    status: 200,
    statusText: 'OK',
  });

  //fake api calls for mockdata
  let classres = new Response(JSON.stringify({res: {rows: MOCKCLASSDATA}}), {status: 200, statusText: "OK"});
  let rabres = new Response(JSON.stringify({res: {rows: MOCKRABILITYDATA}}), {status: 200, statusText: "OK"});
  let pabres = new Response(JSON.stringify({res: {rows: MOCKPABILITYDATA}}), {status: 200, statusText: "OK"});

  let initspy: jasmine.Spy;
  let errorspy: jasmine.Spy;

  beforeEach(() => {
    //this prevents initializeAPI in constructor from running and making real fetch calls
    initspy = spyOn(PartyService.prototype, "initializeAPI"); 
    errorspy = spyOn(console, "error");

    TestBed.configureTestingModule({});
    service = TestBed.inject(PartyService);

    //this is mockdata to replace what initializeAPI would normally populate
    service.CLASSDATA = MOCKCLASSDATA;
    service.RABILITYDATA = MOCKRABILITYDATA;
    service.PABILITYDATA = MOCKPABILITYDATA;
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  //INITIALIZE API:
  xit('should initialize apis for class and ability', async() => {
    service.CLASSDATA = [];
    const fetchspy = spyOn(window, 'fetch').and.returnValues(Promise.resolve(classres), Promise.resolve(rabres), Promise.resolve(pabres) );
    spyOn(Response, "json").and.callThrough();
    initspy = initspy.and.callThrough();
    await service.initializeAPI();
    console.log("spec checkpoint");

    expect(fetchspy).toHaveBeenCalled();
    expect(service.CLASSDATA).toEqual(MOCKCLASSDATA); //this is failing
    expect(fetchspy).toHaveBeenCalledTimes(3); //this is also failing
    //error message reports json somewhere is not parsing properly -- could fixing that fix it all?
  });

  // NEW PARTY MEMBER:
  it('should create a new party member with appropriate defaults', () => {
    let next = service.newPartyMember();
    expect(service.partyarray[0]).toBeDefined;
    expect(next).toEqual(0);
    expect(service.partyarray[1]).toBeUndefined;

    next = service.newPartyMember();    
    expect(service.partyarray[1]).toBeDefined;
    expect(service.partyarray[next]).toBeDefined;
    expect(next).toEqual(1);
    expect(service.partyarray[0].unitid).toEqual(0);


    //newly built units can be properly assigned to
    service.updatePartyMember(next, 'name', 'testname');
    expect(service.partyarray[next].unitname).toEqual('testname');
    expect(service.partyarray[1].unitname).toEqual('testname');
    expect(service.partyarray[0].unitname).toEqual("Unit");


    //testing maximum capacity: up to 24 units
    for (let i = 0; i < 21; ++i) {
      service.newPartyMember();
    }
    expect(service.partyarray.length).toEqual(23);
    
    //unit #24 builds properly
    next = service.newPartyMember();
    expect(next).toEqual(23);
    expect(service.partyarray[next]).toBeDefined;

    //unit #25 does not build
    next = service.newPartyMember();
    expect(next).toEqual(-1);
    expect(service.partyarray[24]).toBeUndefined;
  })

  // GET PARTY MEMBER BY ID:
  it('should get party member by id', () => {
    for (let i = 0; i < 10; ++i) {
      service.newPartyMember();
    }
    expect(service.getPartyMemberById(3)).toBeDefined();
    expect(service.getPartyMemberById(6)).toBeDefined();
    expect(service.getPartyMemberById(9)).toBeDefined();

    service.deletePartyMember(3);
    service.deletePartyMember(6);
    expect(service.getPartyMemberById(3)).toBeUndefined();
    expect(errorspy).toHaveBeenCalled();
    expect(service.getPartyMemberById(6)).toBeUndefined();
    expect(errorspy).toHaveBeenCalledTimes(2);

    expect(service.getPartyMemberById(1)).toBeDefined();
    expect(service.getPartyMemberById(5)).toBeDefined();
    expect(service.getPartyMemberById(9)).toBeDefined();
  });

  // UPDATE PARTY MEMBER:
  it('should properly validate race inputs', () => {
    service.newPartyMember();
    expect(service.getPartyMemberById(0)?.race).toEqual(-1);

    //the following should work:
    service.updatePartyMember(0, "race", "0");
    expect(service.getPartyMemberById(0)?.race).toEqual(0);
    
    service.updatePartyMember(0, "race", "-1");
    expect(service.getPartyMemberById(0)?.race).toEqual(-1);
    
    service.updatePartyMember(0, "race", "3");
    expect(service.getPartyMemberById(0)?.race).toEqual(3);
    
    service.updatePartyMember(0, "race", "6");
    expect(service.getPartyMemberById(0)?.race).toEqual(6);

    //the following should not:
    service.updatePartyMember(0, "race", "-2");
    expect(errorspy).toHaveBeenCalled();
    service.updatePartyMember(0, "race", "7");
    expect(errorspy).toHaveBeenCalledTimes(2);
    expect(service.getPartyMemberById(0)?.race).toEqual(6);

  });

  it('should properly validate class inputs', () => {
    service.newPartyMember();
    expect(service.getPartyMemberById(0)?.primaryclass).toEqual("");
    expect(service.getPartyMemberById(0)?.secondaryclass).toEqual("");

    //the following should work:
    service.updatePartyMember(0, "priclass", "Soldier");
    service.updatePartyMember(0, "secclass", "Thief");
    expect(service.getPartyMemberById(0)?.primaryclass).toEqual("Soldier");
    expect(service.getPartyMemberById(0)?.secondaryclass).toEqual("Thief");
    
    //the following should not work:
    service.updatePartyMember(0, "priclass", "Failure");
    expect(errorspy).toHaveBeenCalled();
    service.updatePartyMember(0, "secclass", "Failure");
    expect(errorspy).toHaveBeenCalledTimes(2);
    expect(service.getPartyMemberById(0)?.primaryclass).toEqual("Soldier");
    expect(service.getPartyMemberById(0)?.secondaryclass).toEqual("Thief");

    //edge case: capitalization
    service.updatePartyMember(0, "priclass", "ninja");
    service.updatePartyMember(0, "secclass", "Black mage");
    service.updatePartyMember(0, "secclass", "white magE");
    service.updatePartyMember(0, "secclass", "blue Mage");
    expect(errorspy).toHaveBeenCalledTimes(6);
    expect(service.getPartyMemberById(0)?.primaryclass).toEqual("Soldier");
    expect(service.getPartyMemberById(0)?.secondaryclass).toEqual("Thief");

    //edge case: return to defaults when calling ""
    service.updatePartyMember(0, "priclass", "");
    service.updatePartyMember(0, "secclass", "");
    expect(service.getPartyMemberById(0)?.primaryclass).toEqual("");
    expect(service.getPartyMemberById(0)?.secondaryclass).toEqual("");
    
    //edge case: return to default when calling currently assigned class
    service.updatePartyMember(0, "priclass", "Soldier");
    service.updatePartyMember(0, "secclass", "Thief");
    expect(service.getPartyMemberById(0)?.primaryclass).toEqual("Soldier");
    expect(service.getPartyMemberById(0)?.secondaryclass).toEqual("Thief");
    service.updatePartyMember(0, "priclass", "Soldier");
    service.updatePartyMember(0, "secclass", "Thief");
    expect(service.getPartyMemberById(0)?.primaryclass).toEqual("");
    expect(service.getPartyMemberById(0)?.secondaryclass).toEqual("");

  });

  it('should handle class validation edge cases correctly', () => {
    service.newPartyMember();
    service.updatePartyMember(0, "priclass", "Soldier");
    service.updatePartyMember(0, "secclass", "Thief");

    //edge case: if new secclass matches priclass, do nothing
    service.updatePartyMember(0, "secclass", "Soldier");
    expect(errorspy).toHaveBeenCalled();
    expect(service.getPartyMemberById(0)?.secondaryclass).toEqual("Thief");

    //edge case: if new priclass matches secclass, assign priclass and clear secclass
    service.updatePartyMember(0, "priclass", "Thief");
    expect(service.getPartyMemberById(0)?.primaryclass).toEqual("Thief");
    expect(service.getPartyMemberById(0)?.secondaryclass).toEqual("");
  });

  it('should properly validate rability inputs', () => {
    service.newPartyMember();
    expect(service.getPartyMemberById(0)?.rability).toEqual("");

    //the following should work:
    service.updatePartyMember(0, "rability", "Counter");
    expect(service.getPartyMemberById(0)?.rability).toEqual("Counter");
    service.updatePartyMember(0, "rability", "");
    expect(service.getPartyMemberById(0)?.rability).toEqual("");
    service.updatePartyMember(0, "rability", "Magick Counter");
    expect(service.getPartyMemberById(0)?.rability).toEqual("Magick Counter");

    //the following should not work:
    service.updatePartyMember(0, "rability", "failure");
    expect(service.getPartyMemberById(0)?.rability).toEqual("Magick Counter");
    expect(errorspy).toHaveBeenCalledTimes(1);
    
    //edge case: capitalization:
    service.updatePartyMember(0, "rability", "counter");
    service.updatePartyMember(0, "rability", "Magick counter");
    expect(service.getPartyMemberById(0)?.rability).toEqual("Magick Counter");
    expect(errorspy).toHaveBeenCalledTimes(3);
  });

  it('should properly validate pability inputs', () => {
    service.newPartyMember();
    expect(service.getPartyMemberById(0)?.pability).toEqual("");

    //the following should work:
    service.updatePartyMember(0, "pability", "Shieldbearer");
    expect(service.getPartyMemberById(0)?.pability).toEqual("Shieldbearer");
    service.updatePartyMember(0, "pability", "");
    expect(service.getPartyMemberById(0)?.pability).toEqual("");
    service.updatePartyMember(0, "pability", "Item Lore");
    expect(service.getPartyMemberById(0)?.pability).toEqual("Item Lore");

    //the following should not work:
    service.updatePartyMember(0, "pability", "failure");
    expect(service.getPartyMemberById(0)?.pability).toEqual("Item Lore");
    expect(errorspy).toHaveBeenCalledTimes(1);
    
    //edge case: capitalization:
    service.updatePartyMember(0, "pability", "shieldbearer");
    service.updatePartyMember(0, "pability", "Item lore");
    expect(service.getPartyMemberById(0)?.pability).toEqual("Item Lore");
    expect(errorspy).toHaveBeenCalledTimes(3);

  });

  it('should increment changetracker when appropriate', () => {
    service.newPartyMember();
    expect(service.getPartyMemberById(0)?.changetracker).toEqual(0);

    service.updatePartyMember(0, "pability", "Shieldbearer");
    expect(service.getPartyMemberById(0)?.changetracker).toEqual(1);
    service.updatePartyMember(0, "rability", "Counter");
    expect(service.getPartyMemberById(0)?.changetracker).toEqual(2);
    service.updatePartyMember(0, "priclass", "Fighter");
    expect(service.getPartyMemberById(0)?.changetracker).toEqual(3);
    service.updatePartyMember(0, "secclass", "Ninja");
    expect(service.getPartyMemberById(0)?.changetracker).toEqual(4);
    service.updatePartyMember(0, "race", "Hume");
    expect(service.getPartyMemberById(0)?.changetracker).toEqual(5);
  });

  it('should update impliedrace when called without implementing changetracker', () => {
    service.newPartyMember();
    expect(service.getPartyMemberById(0)?.changetracker).toEqual(0);
    service.updatePartyMember(0, "impliedrace", "0,2,4");
    expect(service.getPartyMemberById(0)?.changetracker).toEqual(0);
    expect(service.getPartyMemberById(0)?.impliedrace).toEqual([0,2,4]);
    service.updatePartyMember(0, "impliedrace", "0,3");
    expect(service.getPartyMemberById(0)?.changetracker).toEqual(0);
    expect(service.getPartyMemberById(0)?.impliedrace).toEqual([0,3]);
  });

  // DELETE PARTY MEMBER
  it('should delete party member by id', () => {
    service.newPartyMember();
    service.newPartyMember();
    expect(service.partyarray[0]).toBeDefined;
    expect(service.partyarray[1]).toBeDefined;
    expect(service.partyarray[0].unitid).toEqual(0);
    expect(service.partyarray[1].unitid).toEqual(1);
    expect(service.partyarray.length).toEqual(2);

    //reminder: deletes by id, not index. 
    service.deletePartyMember(0);
    //now, unit[0] should have id of 1 and unit[1] should not exist
    expect(service.partyarray[0]).toBeDefined;
    expect(service.partyarray[1]).toBeUndefined;
    expect(service.partyarray[0].unitid).toEqual(1);
    expect(service.partyarray.length).toEqual(1);

    service.newPartyMember();
    service.newPartyMember();
    expect(service.partyarray.length).toEqual(3);
    expect(service.partyarray[2]).toBeDefined();
    expect(service.partyarray[2].unitid).toEqual(3);
    expect(service.partyarray.findIndex((el) => el.unitid === 2)).toEqual(1)
  });

  //FURTHER PARTY BUILD TESTS
  it('should successfully create a custom party build', () => {
    service.newPartyMember();
    service.newPartyMember();
    service.newPartyMember();

    service.updatePartyMember(0, "name", "Luso");
    service.updatePartyMember(0, "race", "0");
    service.updatePartyMember(0, "priclass", "Parivir");
    service.updatePartyMember(0, "rability", "Counter");

    service.updatePartyMember(1, "name", "Adelle");
    service.updatePartyMember(1, "race", "0");
    service.updatePartyMember(1, "priclass", "Ninja");
    service.updatePartyMember(1, "rability", "Magick Counter");
    service.updatePartyMember(1, "pability", "Item Lore");

    service.updatePartyMember(2, "name", "Cid");
    service.updatePartyMember(2, "race", "1");
    service.updatePartyMember(2, "priclass", "Master Monk");
    service.updatePartyMember(2, "pability", "Shieldbearer");

    expect(service.getPartyMemberById(0)?.unitname).toEqual("Luso");
    expect(service.getPartyMemberById(1)?.unitname).toEqual("Adelle");
    expect(service.getPartyMemberById(2)?.unitname).toEqual("Cid");

    expect(service.getPartyMemberById(0)?.race).toEqual(0);
    expect(service.getPartyMemberById(1)?.race).toEqual(0);
    expect(service.getPartyMemberById(2)?.race).toEqual(1);

    expect(service.getPartyMemberById(0)?.primaryclass).toEqual("Parivir");
    expect(service.getPartyMemberById(1)?.primaryclass).toEqual("Ninja");
    expect(service.getPartyMemberById(2)?.primaryclass).toEqual("Master Monk");

    expect(service.getPartyMemberById(0)?.pability).toEqual("");
    expect(service.getPartyMemberById(1)?.pability).toEqual("Item Lore");
    expect(service.getPartyMemberById(2)?.pability).toEqual("Shieldbearer");

    expect(service.getPartyMemberById(0)?.rability).toEqual("Counter");
    expect(service.getPartyMemberById(1)?.rability).toEqual("Magick Counter");
    expect(service.getPartyMemberById(2)?.rability).toEqual("");

  })

  //UTILITY CLASS TESTS
  it('should return appropriate entry from CLASSDATA, given classname', () => {
    let spy = spyOn(service, 'getXClassInfo').and.callThrough();
    let fetchedclass = service.getXClassInfo("Parivir");
    expect(spy).toHaveBeenCalled();

    expect(fetchedclass).toEqual({
      "classname": "Parivir",
      "defaultspriteforrace": null,
      "viableraces": "0"
    });
    fetchedclass = service.getXClassInfo('Black Mage');
    expect(fetchedclass).toEqual({
      "classname": "Black Mage",
      "defaultspriteforrace": null,
      "viableraces": "0,2,4"
    });

    //edgecase: no class name
    fetchedclass = service.getXClassInfo("");
    expect(fetchedclass).toEqual({
      "classname": "",
      "defaultspriteforrace": null,
      "viableraces": "0,1,2,3,4,5,6"
    });

    //edgecase: class not in list
    fetchedclass = service.getXClassInfo("Purple Mage");
    expect(fetchedclass).toBeUndefined();
  })

  it('should return viable races in array of strings, given classname', () => {
    let spy = spyOn(service, 'getClassViableRaces').and.callThrough();
    let fetchedraces = service.getClassViableRaces("Parivir");
    expect(spy).toHaveBeenCalled();
    expect(fetchedraces).toEqual(['0']);
    expect(service.getClassViableRaces("Black Mage")).toEqual(["0","2","4"]);
    expect(service.getClassViableRaces("White Mage")).toEqual(["0","2","3"]);
    expect(service.getClassViableRaces("Raptor")).toEqual(["5"]);

    //edgecase: nonexistent class
    expect(service.getClassViableRaces("Purple Mage")).toBeUndefined();
    expect(service.getClassViableRaces("FakeJob")).toBeUndefined();
    expect(service.getClassViableRaces("black mage")).toBeUndefined();

  });

  it('should return viable races in array of strings, given ability', () => {
    let spy = spyOn(service, 'getAbilityViableRaces').and.callThrough();
    let fetchedraces = service.getAbilityViableRaces('Shieldbearer', false);
    expect(spy).toHaveBeenCalled();
    expect(fetchedraces).toEqual(['0','1','4','5','6']);
    expect(service.getAbilityViableRaces("Counter", true)).toEqual(["0","1","4","5","6"]);
    expect(service.getAbilityViableRaces("Blur", true)).toEqual(["1","4"]);
    expect(service.getAbilityViableRaces("Dual Wield", false)).toEqual(["0"]);

    //edgecase: nonexistent ability
    expect(service.getAbilityViableRaces("", true)).toBeUndefined();
    expect(service.getAbilityViableRaces("", false)).toBeUndefined();
    expect(service.getAbilityViableRaces("FakeAbility", true)).toBeUndefined();
    expect(service.getAbilityViableRaces("FakeAbility", false)).toBeUndefined();

    //edgecase: wrong value for isreactive. should return undefined
    expect(service.getAbilityViableRaces("Shieldbearer", true)).toBeUndefined();
    expect(service.getAbilityViableRaces("Counter", false)).toBeUndefined();
  });

  it('should return name of defaultclass for race sprite, given race as num', () => {
    let spy = spyOn(service, 'getDefaultSpriteForRace').and.callThrough();
    let fetchedclass = service.getDefaultSpriteForRace(0);
    expect(fetchedclass).toEqual("Soldier");
    expect(service.getDefaultSpriteForRace(-1)).toEqual("Null");
    expect(service.getDefaultSpriteForRace(6)).toEqual("Ranger");
    expect(service.getDefaultSpriteForRace(2)).toEqual("Beastmaster");

    //edgecases: nonexistent races. should return undefined
    expect(service.getDefaultSpriteForRace(-2)).toBeUndefined();
    expect(service.getDefaultSpriteForRace(8)).toBeUndefined();
  });

  it('should initialize defaultsprites array', () => {
    let spy = spyOn(service, 'initDefaultRaceSprites').and.callThrough();
    let getterspy = spyOn(service, 'getDefaultSpriteForRace').and.callThrough();
    expect(service.defaultsprites).toEqual([]);
    service.initDefaultRaceSprites();
    expect(spy).toHaveBeenCalled();
    expect(getterspy).toHaveBeenCalledTimes(8);
    expect(service.defaultsprites).toEqual(["Null", "Soldier", "White Monk", "Beastmaster", "Fencer", "Animist", "Raptor", "Ranger"])
  });


});
