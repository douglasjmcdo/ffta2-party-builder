DATABASE: VERCEL POSTGRESQL
    DATABASE TABLE: CLASS INFO
    entry info:
        string classname
        intarray viable_races
        optional int default_race_sprite (empty unless it is the default for x race)

        // sprite urls can be autocalculated: 
        //"FFTA2-" + [optional: race if multiple races] + classname + "Sprite.webp"
        //f.ex. "FFTA2_SoldierSprite.webp" or "FFTA2_HumeWhiteMageSprite.webp"

    DATABASE TABLE: ABILITY INFO
    entry info:
        string abilityname
        bool isreactive
        intarray viable_races

    OPTIONAL DATABASE TABLE: MOVE INFO?
        string movename
        string description
        string elemental
        string[] classes (i think this caps at 2 or 3)


Structural design:

APP COMPONENT:
    PARTYDATA variables:
        string clanname
        array of COMPONENT: UNIT (min 1, max 24). default is 1.
        //if i want to do partyanalysis, add variables here for those to be calculated in advance?

    contains both MAIN and EDIT pages, which can both access PARTYDATA 

MAIN PAGE:
    COMPONENT: PARTYDISPLAY
        displays partydata
        html: clan name as header, then foreach of the array 

    COMPONENT: UNIT
        int unitid (autoassigned at creation)
        int sortorder (in case of custom sorting or deleted units?)
        bool isdefault = true

        //this collection is the 'unit data':
        string unitname?
        int race 0-6
        string primaryclass "classname"
        string secondaryclass "classname"
        string rability "rname"
        string pability "pname"

        -pull sprite, movesets for both classes from db 
        -default to empty values and a default sprite on construction

        html: display = sprite.  highlight on hover
        onclick, take unitid, isdefault and navigate to editpage

        functions: getters/setters to all above
            function checkdefault: if any part of unit data is non-default, set to false. 
                                   if all unit data is RETURNED to default, return to true


    COMPONENT: PARTYANALYSIS
        uncertain... displays some sort of info/analysis. possibilities:

        moveset questions:
        how many party members know x move?  (f.ex. silence, exorcism, etc)
        maybe better, how many party members have ACCESS to x status effect? (sleep, silence...)
        how many party members have access to healing/elemental moves/etc?
        how many party members have area moves?

        class-based questions (info would likely need adding to class table)
        how many party members have a base movement of 3 vs 4 tiles?
        how many party members have "high" stats aka stats over x number? idk if i want to add a stat calculator
        how many party members are focused on magic/physical/hybrid?
        how many party members are ranged v melee?

    COMPONENT: EXPORTMENU
        button: convert party to txt format and download as .txt file


EDIT PAGE:
    receives selectedunit from passed in unitid

    COMPONENT: name
        optional text form to provide name? 

    COMPONENT: PICKRACE
        radio button display of all races. use default_race_sprite

    COMPONENT: PICKPRIMARY
        radio button display of all classes. 
        use first entry in sprite OR if race is specified, use that race's sprite

    COMPONENT: PICKSECONDARY
        same as prev

    COMPONENT: PICKRABILITY
        radio button text display of all rabilities

    COMPONENT: PICKPABILITY
        radio button text display of all pabilities

    edit page gets/sets to selectedunit.
    selections to all above components should autofilter based off of selectedunit
    QUESTION: how to i arrange the architecture such that edit page can affect partydisplay component inside mainpage? 
    do we just pass unit back and forth? or maybe move party info into the parent component for both main AND edit?

    COMPONENT: DECIDE
        confirm button -> returns to main page and updates selectedunit. 
                          if isdefault, then +1 to unit array UNLESS party is already full (24)
        delete button -> returns to main page and deletes selectedunit. deletion should handle sortorder
    



PAGES:
main -> edit
    actions from main page: add party member, save party to csv. import from txt/csv? TSV
    stretch: save to hall of fame?
optional:
analysis page?
hall of fame page?


UNIQUE CLASS RESTRICTIONS:
can only have 1 of each of the following classes:
-bard 
        -cannot be chocobo knight
        -must be named hurdy
-agent
        -can only be primary class
        -cannot have a secondary class
-sky pirate
        -must be named vaan
-dancer
        -must be named penelo
-heritor
        -must be named adelle
additionally:
-named character montblanc cannot be chocobo knight

UNIT SPRITE LOGIC, in order, such that UNIT SPRITE can also indicate RACE:
-if named on UNIQUECHARS list, use custom sprite
-else if classed OR subclassed as heritor, agent, sky pirate, bard, or dancer, use that sprite
-else
    -if race is not defined or implied to 1 or less, use NULL
    -else:
        -if primary class, use priclass + race
        -if secclass, use secclass + race
        -else use default sprite for race
