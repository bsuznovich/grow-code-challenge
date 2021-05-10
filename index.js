const express = require('express');
const { get } = require("request");
const app = express()
const port = 3000

const request = require('request')

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/people/', (req, res) => {
    let allPeople = []
    let page = 1
    const url = "https://swapi.dev/api/people/?page="
    const getPeople = (pageSize) => {
        request(`${url}${pageSize}`, (err, response, body) => {
            let people = JSON.parse(body)
            allPeople = allPeople.concat(people.results)
            if(people.next){
                page++
                getPeople(page)
            }
            else{
                if(req.query.sortBy){
                    let query = req.query.sortBy
                    if(query == "name"){
                        allPeople = allPeople.sort((a,b) => {
                            return (a[query] < b[query]) ? -1 : (a[query] > b[query]) ? 1 : 0
                        })
                    }
                    else{
                        allPeople = allPeople.sort((a,b) => {
                            return b[query] - a[query]
                        })
                    }
                }
                return res.send(allPeople)
            }
        });
    }
    return getPeople(page)
})


// Tried more ways than I can count to get residents to wait for reassignment before rendering but I'm throwing in the towel.

app.get('/planets', (req, res) => {
    request('https://swapi.dev/api/planets/', async (err, response, body) => {
        let planets = JSON.parse(body)
        let getResidents = async () => {
            let arr = []
            let newResidents = async (planet) => {
                let resArr = []
                for(let resident of planet.residents){
                    await request(resident, async (err, response, body) => {
                        let resInfo = JSON.parse(body)
                        resArr = await resArr.concat([resInfo.name])
                        console.log("resArr",resArr)
                        return resArr
                    })
    
                }
            }
            for(let planet of planets.results){
                arr = await arr.concat(newResidents(planet))
                console.log("arr", arr)
                return arr
            }
        }
        await getResidents()
        res.send(planets.results)
    })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})