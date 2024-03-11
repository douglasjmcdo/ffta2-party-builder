import { SelectSpritePipe } from './select-sprite.pipe';
import { PartyService } from './party.service';
import { Unitdata } from './unitdata';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockPartyService } from './party.service.mock';


describe('SelectSpritePipe', () => {
  let spipe: SelectSpritePipe;
  let initspy: jasmine.Spy;

  beforeEach(async() => {
    await TestBed.configureTestingModule({
      imports: [],
      providers: [
        { provide: PartyService, useValue: MockPartyService }
      ],
    })
    .compileComponents();
    initspy = spyOn(PartyService.prototype, "initializeAPI"); 
    spipe = new SelectSpritePipe(new PartyService);
  });

  it('create an instance', () => {
    //todo: fake partyservice or else youll get api calls
    expect(spipe).toBeTruthy();
  });

  it('double check api calls were faked properly', () => {
    let checker = spipe.ps.RABILITYDATA?.find(
      (job: {abilityname: string; }) => job.abilityname === 'Counter'
    );
    spipe.ps.initializeAPI();
    console.log("SPIPE", spipe.ps.RABILITYDATA, spipe.ps.RACENAMES);
    expect(checker.abilityname).toEqual("Counter");
    checker = spipe.ps.RABILITYDATA?.find(
      (job: {abilityname: string; }) => job.abilityname === 'Bonecrusher'
    );
    expect(checker).toBeUndefined;

  })

  it('should handle undefined entry by returning default sprites', () => {
    //expect(spipe.transform(0, )).toBe("");
  });
});
