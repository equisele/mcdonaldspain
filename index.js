const fs = require('fs');
const fetch = require('node-fetch');
const csv = require("csv-parse");

// Create csv utf8 encoded to store McDonald restaurants
const output = fs.createWriteStream(__dirname + "/output/mcrestaurantspain.csv",{encoding: 'utf8'})

let csv_header = ['siteID','name','address','cp','city','phone','lat','lng','email','prov','prov_abbr','open','opening_date','company_iban','company_bizum','company_phone','company_email','company_cif','company_name','company_address','services','schedule_rest','schedule_rest_week','schedule_rest_weekend','schedule_rest_sunday','schedule_rest_festive','schedule_mcexpress','schedule_mcexpress_week','schedule_mcexpress_weekend','schedule_mcexpress_sunday','schedule_mcexpress_festive','schedule_mcauto','schedule_mcauto_week','schedule_mcauto_weekend','schedule_mcauto_sunday','schedule_mcauto_festive','schedule_24h'];
output.write(csv_header.join("\t") + "\r\n"), data = [], jsonData = [];

/* Asyng function to fectch data from McDonalds API Url */
async function fetchData(url) {
    let response = await fetch(url, { 'method': 'get' })
    let jsonResponse = await response.json();
    let restaurants = jsonResponse.restaurants;
    return restaurants;
}

/* Extract function to get al values from keys in column */
function extractColumn(arr, column) {
    return arr.map(x => x[column])
}

/* Remove duplicates function from Array or Object for a given key  */
function removeDuplicates(arr, key) {
    if (!(arr instanceof Array) || key && typeof key !== 'string') {
        return false;
    }

    if (key && typeof key === 'string') {
        return arr.filter((obj, index, arr) => {
            return arr.map(mapObj => mapObj[key]).indexOf(obj[key]) === index;
        });

    } else {
        return arr.filter(function(item, index, arr) {
            return arr.indexOf(item) == index;
        });
    }
}

fs.createReadStream("csv/cities-spain-top.csv")
    .pipe(csv({ "delimiter": ";", "from_line": 2 }))
    .on('data', (row) => {
        let url = 'https://mcdonalds.es/api/restaurants?lat=' + row[3] + '&lng=' + row[4] + '&radius=100000';
        // store fetched data into array for final cleaning & saving proccess
        data[data.length] = fetchData(url)
            .then((res) => {
                console.log('fetching url: ', url);
                // loop every restaurant from response
                res.forEach(e => {
                    console.log(e.site, ' ok!');
                    // Check restaurant schedules
                    let restSchedules = e.schedules.restaurant;
                    if (restSchedules === false) {
                        scheduleRest = false, rweek = false, rweekend = false, rsunday = false, rfestive = false;

                    } else {
                        scheduleRest = true;
                        rweek = e.schedules.restaurant.week.start + '-' + e.schedules.restaurant.week.end;
                        rweekend = e.schedules.restaurant.weekend.start + '-' + e.schedules.restaurant.weekend.end;
                        rsunday = e.schedules.restaurant.sunday.start + '-' + e.schedules.restaurant.sunday.end;
                        rfestive = e.schedules.restaurant.festive.start + '-' + e.schedules.restaurant.festive.end;
                    }

                    // Check mcexpress schedules
                    let McxSchedules = e.schedules.mcexpress;
                    if (McxSchedules === false) {
                        scheduleMcx = false, xweek = false, xweekend = false, xsunday = false, xfestive = false;

                    } else {
                        scheduleMcx = true;
                        xweek = e.schedules.mcexpress.week.start + '-' + e.schedules.mcexpress.week.end;
                        xweekend = e.schedules.mcexpress.weekend.start + '-' + e.schedules.mcexpress.weekend.end;
                        xsunday = e.schedules.mcexpress.sunday.start + '-' + e.schedules.mcexpress.sunday.end;
                        xfestive = e.schedules.mcexpress.festive.start + '-' + e.schedules.mcexpress.festive.end;
                    }

                    // Check mcauto schedules
                    let McASchedules = e.schedules.mcauto;
                    if (McASchedules === false) {
                        scheduleMca = false, aweek = false, aweekend = false, asunday = false, afestive = false;

                    } else {
                        scheduleMca = true;
                        aweek = e.schedules.mcauto.week.start + '-' + e.schedules.mcauto.week.end;
                        aweekend = e.schedules.mcauto.weekend.start + '-' + e.schedules.mcauto.weekend.end;
                        asunday = e.schedules.mcauto.sunday.start + '-' + e.schedules.mcauto.sunday.end;
                        afestive = e.schedules.mcauto.festive.start + '-' + e.schedules.mcauto.festive.end;
                    }

                    // store 24h field
                    let sched24h = e.schedules["24h"];

                    // Extract services and store them in one field joined by pipes
                    let services = extractColumn(e.services, "name").join("|");

                    // Store all business data in one array
                    let logger = [e.site, e.name.replace('´','\''), e.address, e.cp, e.city, e.phone, e.lat, e.lng, e.email, e.province, e.province_abbr, e.open, e.opening_date, e.birthday.iban, e.birthday.bizum, e.birthday.phone, e.birthday.mail, e.birthday.cif, e.birthday.name, e.birthday.address, services, scheduleRest, rweek, rweekend, rsunday, rfestive, scheduleMcx, xweek, xweekend, xsunday, xfestive, scheduleMca, aweek, aweekend, asunday, afestive, sched24h];
                    // Save line to file tab separated
                    output.write(logger.join("\t") + "\r\n");

                    // Store Restaurant json data into array for saving later 
                    jsonData.push(e);
                });
            })

    })
    .on('end', () => {
        console.log('100% file processed!');
        Promise.all(data)
            .then(() => {
                // Cleaning duplicates from Json
                let uniques = removeDuplicates(jsonData,'site');
                // Json to string for saving Json data
                let outputJson = JSON.stringify(uniques);
                // Write json file
                fs.writeFile(__dirname + '/output/mcrestaurantspain.json', outputJson, 'utf8', function (err) {
                    if (err) {
                        return console.log(err);
                    }
                });
                // close csv file
                output.close;

            });
    });
