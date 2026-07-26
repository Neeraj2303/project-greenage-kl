import urllib.request
import json
import os

url = "https://raw.githubusercontent.com/geohacker/kerala/master/geojsons/district.geojson"
output_path = "d:/PROJECT_GREENAGE-KL/dashboard/src/components/maps/KeralaGeoJSON.ts"

print("Downloading detailed Kerala district boundaries GeoJSON...")
try:
    with urllib.request.urlopen(url) as response:
        geojson = json.loads(response.read().decode())
    
    # Process features: change property 'DISTRICT' to 'name'
    for feature in geojson["features"]:
        dist_name = feature["properties"]["DISTRICT"]
        feature["properties"] = {
            "name": dist_name
        }
    
    # Write as a TypeScript module export
    print("Writing to:", output_path)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("export const keralaGeoJSON = ")
        json.dump(geojson, f, indent=2)
        f.write(";\n\nexport default keralaGeoJSON;\n")
        
    print("Successfully updated KeralaGeoJSON.ts with detailed district boundaries.")
except Exception as e:
    print("Error:", e)
