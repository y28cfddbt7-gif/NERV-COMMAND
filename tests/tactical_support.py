"""Real pointer and command controls shared by current battle regressions."""
def wait(test):
    test.page.wait_for_function('!document.getElementById("shell").inert && !NERV_BATTLE.snapshot().tactical.pending && !NERV_BATTLE.snapshot().busy')
def control(test,key):
    test.page.locator('[data-tactical="'+key+'"]').click();wait(test)
def aim(test,x=.5,y=.19):
    box=test.page.locator('#battleTacticalCanvas').bounding_box();test.page.mouse.click(box['x']+box['width']*x,box['y']+box['height']*y);wait(test)
def move(test,col,row):
    t=test.page.evaluate('NERV_TACTICAL.snapshot().state');p=t['pos'];box=test.page.locator('#battleTacticalCanvas').bounding_box()
    def point(c,r):return (box['x']+box['width']*(.5+(c-1)*(.17+r*.045)),box['y']+box['height']*(.34+r*.17))
    a=point(p['col'],p['row']);b=point(col,row);test.page.mouse.move(*a);test.page.mouse.down();test.page.mouse.move(*b,steps=5);test.page.mouse.up();wait(test)
def fire(test):
    test.page.locator('#tacticalFire').click();wait(test)
def win(test,weapon):
    if weapon=='positron':
        control(test,'scan');control(test,'scan');control(test,'cable');control(test,'charge');control(test,'charge')
        if test.state()['defense']['energy']<40:control(test,'supply')
        aim(test);fire(test);return
    control(test,'scan');control(test,'scan');move(test,0,2);move(test,1,1);control(test,'at');control(test,'neutralize')
    for _ in range(5):
        d=test.state()['defense']
        if d['status']!='active':return
        if test.page.evaluate('NERV_OPERATIONS.combatState().exposedUntil')<=d['round']:control(test,'neutralize')
        aim(test);fire(test)
