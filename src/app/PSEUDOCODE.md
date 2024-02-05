DATABASE INFO
    DATABASE TABLE: CLASS INFO
    entry info:
        string classname
        intarray viable_races
        bool default_race_sprite
        array moveset
        array of pairs sprite [int race, string spriteurl]

    DATABASE TABLE: ABILITY INFO
    entry info:
        string abilityname
        bool isreactive
        intarray viable_races

    OPTIONAL DATABASE TABLE: MOVE INFO?
        string movename
        string description
        string elemental


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
        how many party members know x move?  (f.ex. silence, exorcism, etc)
        maybe better, how many party members have ACCESS to x status effect? (sleep, silence...)
        how many party members have access to healing/elemental moves/etc?
        how many party members have a base movement of 3 vs 4 tiles?
        how many party members have "high" stats aka stats over x number? idk if i want to add a stat calculator
        how many party members are focused on magic/physical/hybrid?
        how many party members are ranged v melee?
        how many party members have area moves?

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
    



