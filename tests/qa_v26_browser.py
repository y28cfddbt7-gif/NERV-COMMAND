from playwright.sync_api import sync_playwright
import json, traceback, os
file='file:///mnt/data/nerv_v26_work/index.html'
results=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-web-security'])
 for width in (320,390,430):
  page=b.new_page(viewport={'width':width,'height':844},device_scale_factor=1)
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.route('**/*',lambda route: route.abort());page.set_content(open('/mnt/data/nerv_v26_work/index.html').read(),wait_until='domcontentloaded',timeout=35000)
  page.wait_for_timeout(500)
  page.locator('#bootSkip').click()
  page.wait_for_timeout(250)
  for pg in ['home','infra','eva','magi','mission','weather','tools','settings']:
   page.evaluate('(pg)=>window.NERV_TEST.open(pg)',pg)
   page.wait_for_timeout(80)
   overflow=page.evaluate('document.documentElement.scrollWidth - innerWidth')
   results.append([width,pg,'over',overflow])
   if overflow>3: print('OVERFLOW',width,pg,overflow)
   if pg in ('home','eva','magi','mission') and width==390:
    page.screenshot(path=f'/mnt/data/nerv_v26_work/preview_{pg}.png',full_page=True)
  if width==390:
   page.evaluate('window.NERV_TEST.open("eva")')
   page.evaluate('''()=>{document.querySelector('.eva-illustration').classList.add('at-on');document.querySelector('.eva-display').dataset.state='DEPLOYED'}''')
   page.wait_for_timeout(900)
   metrics=page.evaluate('''()=>{
    let rig=document.querySelector('.eva-reference-rig').getBoundingClientRect();
    let f=document.querySelector('.v26-at-field').getBoundingClientRect();
    let ring=document.querySelector('.eva-measure-ring').getBoundingClientRect();
    return {rigX:rig.x+rig.width/2,fieldX:f.x+f.width/2,ringX:ring.x+ring.width/2,fieldOpacity:getComputedStyle(document.querySelector('.v26-at-field')).opacity};}''')
   print('AT FIELD METRICS',metrics)
   page.screenshot(path='/mnt/data/nerv_v26_work/preview_at_field.png',full_page=True)
   page.evaluate('window.NERV_TEST.open("mission")')
   page.locator('#missionAction').click()
   page.locator('#missionAction').click()
   page.locator('#missionAction').click()
   page.wait_for_timeout(100)
   print('mission phase',page.evaluate('window.NERV_TEST.mission()'))
   print('charging btn disabled?',page.locator('#v26ChargeAction').is_disabled())
   page.locator('#v26ChargeAction').click()
   page.locator('#v26ChargeAction').click()
   page.locator('#v26ChargeAction').click()
   page.locator('#v26ChargeAction').click()
   print('charge',page.locator('#v26Charge').inner_text(), 'heat',page.locator('#v26Heat').inner_text())
   print('navigation buttons',page.locator('.bottom-nav [data-nav]').count())
  print('WIDTH',width,'errors',errors[:12]);page.close()
 b.close()
print('RESULTS',len(results),'FAILOVER',sum(x[3]>3 for x in results))
