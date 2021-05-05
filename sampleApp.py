import requests
geocodeUrl="https://geocode.search.hereapi.com/v1/geocode"
routeUrl="https://router.hereapi.com/v8/routes"
myparams={}
myparams['apiKey']="API_KEY" # please add your api key


# myparams['transportMode']= # "car" "truck" "pedestrian" "bicycle" "scooter" "taxi" "bus"
# myparams['origin']=
# myparams['destination']=

def getRoute(fromAddr, toAddr, mode):
    routeParams = myparams
    source = getLatLonFromGeocode(fromAddr)
    print(f"got source as {source}")
    dest = getLatLonFromGeocode(toAddr)
    print(f"got destination as {dest}")
    routeParams['origin']=str(source['lat'])+","+str(source['lng'])
    routeParams['destination']=str(dest['lat'])+","+str(dest['lng'])
    routeParams['transportMode'] = mode
    routeParams['return']="polyline,actions,instructions" # turnByTurnActions
    print("calculating route..")
    resp = requests.get(url=routeUrl, params=routeParams)
    return resp.json()

def getLatLonFromGeocode(addr_str):
    print(f"getting location for {addr_str}")
    geocodeParams = myparams
    geocodeParams['q']=addr_str
    resp = requests.get(url=geocodeUrl, params=geocodeParams)
    result = resp.json()
    return result['items'][0]['position']

op = getRoute("Gateway of India, Mumbai","Nesco IT Park, Goregaon, Mumbai","car")
print(op)