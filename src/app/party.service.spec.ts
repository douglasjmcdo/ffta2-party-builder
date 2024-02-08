import { TestBed } from '@angular/core/testing';

import { PartyService } from './party.service';

describe('PartyService', () => {
  let service: PartyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PartyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
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
    expect(service.partyarray[0].unitname).toEqual("default");


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
    expect(service.getPartyMemberById(1)).toBeDefined();
    expect(service.getPartyMemberById(3)).toBeUndefined();
    expect(service.getPartyMemberById(5)).toBeDefined();
    expect(service.getPartyMemberById(6)).toBeUndefined();
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
    expect(service.getPartyMemberById(0)?.race).toEqual(6);
    //todo: expect error message

    service.updatePartyMember(0, "race", "7");
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
    service.updatePartyMember(0, "secclass", "Failure");
    expect(service.getPartyMemberById(0)?.primaryclass).toEqual("Soldier");
    expect(service.getPartyMemberById(0)?.secondaryclass).toEqual("Thief");

    //edge case: capitalization
    service.updatePartyMember(0, "priclass", "ninja");
    service.updatePartyMember(0, "secclass", "Black mage");
    service.updatePartyMember(0, "secclass", "white magE");
    service.updatePartyMember(0, "secclass", "blue Mage");
    expect(service.getPartyMemberById(0)?.primaryclass).toEqual("Soldier");
    expect(service.getPartyMemberById(0)?.secondaryclass).toEqual("Thief");
    //todo: expect error messages

    //edge case: return to defaults
    service.updatePartyMember(0, "priclass", "");
    service.updatePartyMember(0, "secclass", "");
    expect(service.getPartyMemberById(0)?.primaryclass).toEqual("");
    expect(service.getPartyMemberById(0)?.secondaryclass).toEqual("");

  });

  it('should handle class validation edge cases correctly', () => {
    service.newPartyMember();
    service.updatePartyMember(0, "priclass", "Soldier");
    service.updatePartyMember(0, "secclass", "Thief");

    //edge case: if new secclass matches priclass, do nothing
    service.updatePartyMember(0, "secclass", "Soldier");
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
    
    //edge case: capitalization:
    service.updatePartyMember(0, "rability", "counter");
    service.updatePartyMember(0, "rability", "Magick counter");
    expect(service.getPartyMemberById(0)?.rability).toEqual("Magick Counter");
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
    
    //edge case: capitalization:
    service.updatePartyMember(0, "pability", "shieldbearer");
    service.updatePartyMember(0, "pability", "Item lore");
    expect(service.getPartyMemberById(0)?.pability).toEqual("Item Lore");
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

  //FURTHER TESTS
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

    console.log(service.partyarray);

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

});
