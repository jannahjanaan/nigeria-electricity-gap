import urllib.request

def download(url, filename):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    data = urllib.request.urlopen(req).read()
    with open(filename, 'wb') as f:
        f.write(data)
    print(f"Downloaded {filename}")

download('https://code.highcharts.com/maps/highmaps.js', 'highmaps.js')
download('https://code.highcharts.com/mapdata/countries/ng/ng-all.js', 'ng-all.js')
