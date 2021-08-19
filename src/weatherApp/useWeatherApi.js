import { useState, useEffect, useCallback } from 'react';

const fetchCurrentWeather=()=>{
    return new Promise((resolve,reject)=>{
      const data=axios.get('https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-CB5BD3BF-9F7E-4ED3-B0CB-48F63F598403&locationName=臺北')
      .then((response)=>{
        console.log("stary");
        const locationData=response.data.records.location[0];
        const weatherElements=locationData.weatherElement.reduce(
          (neededElements,item)=>{
            console.log(neededElements,item)
            if (['WDSD', 'TEMP', 'HUMD'].includes(item.elementName)) {
              neededElements[item.elementName] = item.elementValue;
            }
            return neededElements;
          },
          {}
        );
        console.log(weatherElements)
        resolve({
          observationTime: locationData.time.obsTime,
          locationName: locationData.locationName,
          description: '多雲時晴',
          temperature: weatherElements.TEMP,
          windSpeed: weatherElements.WDSD,
          humid: weatherElements.HUMD,
        });
      });
    })
};

const fetchWeatherForecast=()=>{
    return new Promise((resolve,reject)=>{
      const data=axios.get('https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-CB5BD3BF-9F7E-4ED3-B0CB-48F63F598403&locationName=臺北市')
      .then((response)=>{
        const locationData=response.data.records.location[0];
        const weatherElements=locationData.weatherElement.reduce(
          (neededElements, item) => {
            if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
              neededElements[item.elementName] = item.time[0].parameter;
            }
            return neededElements;
          },
          {},
        );

        resolve({
          description: weatherElements.Wx.parameterName,
          weatherCode: weatherElements.Wx.parameterValue,
          rainPossibility: weatherElements.PoP.parameterName,
          comfortability: weatherElements.CI.parameterName,
        })
      })
      .catch((error)=>{
        reject(error)
      })
    })
}

const useWeatherApi = () => {
    const [weatherElement,setWeatherElement]=useState({
        observationTime: new Date(),
        locationName: '',
        humid: 0,
        temperature: 0,
        windSpeed: 0,
        description: '',
        weatherCode: 0,
        rainPossibility: 0,
        comfortability: '',
        isLoading:true,
    });

    const fetchData=useCallback(()=>{
        const fetchingData =async ()=>{
        const [currentWeather, weatherForecast] = await Promise.all([
            fetchCurrentWeather(),
            fetchWeatherForecast(),
        ]);

        setWeatherElement({
            ...currentWeather,
            ...weatherForecast,
            isLoading:false,
        });
        }
        setWeatherElement((preState)=>({
        ...preState,
        isLoading:true,
        }))
        fetchingData();
    },[]);

    useEffect(()=>{
        console.log('execute function in useEffet');
        fetchData();
    },[fetchData])

    return [weatherElement, fetchData];
}

export default useWeatherApi;