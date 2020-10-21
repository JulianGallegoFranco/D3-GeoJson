//We only want to display the final day of each month as the data not everysingle day
d3.queue()
    .defer(d3.json, './countries-50m.json')
    .defer(d3.csv, './WHO-COVID-19-global-data.csv',function(row){
        return{
            Date_reported: row.Date_reported,
            Country_code: row.Country_code,
            Country: row.Country,
            WHO_region: row.WHO_region,
            New_cases: +row.New_cases,
            Cumulative_cases: +row.Cumulative_cases,
            New_deaths: +row.New_deaths,
            Cumulative_deaths: +row.Cumulative_deaths
        }
    })
    .await(function(error,map,covidData){
        if (error) throw error;

        var dates = [];//Saving all the date so we can use them to update the map
        covidData.forEach(row => {
            dates.push(row.Date_reported);
        });
        var minDate = 0;
        var maxDate = dates.length;

        var width = 960;
        var height = 600;
        var geoData = topojson.feature(map,map.objects.countries).features

        var projection = d3.geoMercator() 
                        .scale(125)
                        .translate([(width / 2), height / 1.4]);
        var path = d3.geoPath().projection(projection)
         
        
        d3.select('svg')
            .attr('width', width)
            .attr('height', height)
        .selectAll('path')
        .data(geoData) 
        .enter()
        .append('path')
        .classed('country',true)
            .attr('d', path);
        //graphGenerator(dates[minDate]);
        
        var select = d3.select('select');
        select.on('change',d => graphGenerator(d3.event.target.value));
        
        function graphGenerator(date){
            var covid19Data = covidData.filter(d => d.Date_reported === date); //Will have to update in a map_generator function!
            
            covid19Data.forEach(row => {
                var countries = geoData.filter(d => d.properties.name === row.Country);
                countries.forEach(country => {
                    country.properties = row;
                });

            var scale = d3.scaleLinear()
                .domain([0,100000,d3.max(covid19Data,d => d.Cumulative_cases)])
                .range(['yellow','orange','red']);
            
            d3.selectAll('.country')
                .attr('fill',d => scale(d.properties.Cumulative_cases));
        });
        }
        //Seems to be working; figure out how to update depending on month
        //Verify if the values match using a tool-tip 
        
            
    })

