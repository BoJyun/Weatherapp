import React , { useState, useEffect,useCallback } from "react";
import styled from "@emotion/styled";
import AirFlowIcon  from './images/airFlow.svg';
import RainIcon from './images/rain.svg';
import ReFreshIcon from './images/refresh.svg';
import CogIcon  from './images/cog.svg';
import WeatherIcon from './WeatherIcon.js';
import axios from 'axios';
import LoadingIcon from './images/loading.svg';
import WeatherSetting from './WeatherSetting';
import {findLocation } from './utils';

const Container = styled.div`
  background-color: #ededed;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WeatherCard = styled.div`
  position: relative;
  min-width: 360px;
  box-shadow: 0 1px 3px 0 #999999;
  background-color: #f9f9f9;
  box-sizing: border-box;
  padding: 30px 15px;
`;

const Location=styled.div`
    font-size:36px;
    color: #212121;
    margin-bottom: 20px;
`;

const Description = styled.div`
  font-size: 16px;
  color: #828282;
  margin-bottom: 30px;
`;

const CurrentWeather = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Temperature = styled.div`
  color: #757575;
  font-size: 96px;
  font-weight: 300;
  display: flex;
`;

const Celsius = styled.div`
  font-weight: normal;
  font-size: 42px;
`;

const AirFlow = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: #828282;
  margin-bottom: 20px;

  svg {
    margin-right: 30px;
  }
`;

const Rain = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: #828282;

  svg {
    margin-right: 30px;
  }
`;

const ReFresh = styled.div`
  /* 在這裡寫入 CSS 樣式 */
  /*width: 15px;
  height: 15px;*/
  position: absolute;
  right: 15px;
  bottom: 15px;
  cursor: pointer;

  svg {
    animation: rotate infinite 1.5s linear;
    animation-duration: ${({ isLoading }) => (isLoading ? '1.5s' : '0s')};
  }
  @keyframes rotate {
    from {
      transform: rotate(360deg);
    }
    to {
      transform: rotate(0deg);
    }
  }
`;

const Cog = styled.div`
  position: absolute;
  top: 30px;
  right: 15px;
  width: 15px;
  height: 15px;
  cursor: pointer;
`;

const WeatherApp=()=>{
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
  const [currentPage, setCurrentPage] = useState('WeatherCard');
  const [currentCity, setCurrentCity]=useState('臺北市');
  const currentLocation = findLocation(currentCity) || {};

  const fetchCurrentWeather=(locationName)=>{
    return new Promise((resolve,reject)=>{
      const data=axios.get('https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-CB5BD3BF-9F7E-4ED3-B0CB-48F63F598403&locationName='+locationName)
      .then((response)=>{
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

        resolve({
          observationTime: locationData.time.obsTime,
          locationName: locationData.locationName,
          temperature: weatherElements.TEMP,
          windSpeed: weatherElements.WDSD,
          humid: weatherElements.HUMD,
        });
      });
    })
  };

  const fetchWeatherForecast=(cityName)=>{
    return new Promise((resolve,reject)=>{
      const data=axios.get('https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-CB5BD3BF-9F7E-4ED3-B0CB-48F63F598403&locationName='+cityName)
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

  const fetchData=useCallback(()=>{
    const fetchingData =async ()=>{
      const [currentWeather, weatherForecast] = await Promise.all([
        fetchCurrentWeather(currentLocation.locationName),
        fetchWeatherForecast(currentLocation.cityName),
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
  },[currentLocation.locationName,currentLocation.cityName]);

  useEffect(()=>{
    console.log('execute function in useEffet');
    fetchData();
  },[fetchData])

  return(
      <Container>
        {currentPage=='WeatherCard' &&
          <WeatherCard>
              <Cog>
                <CogIcon onClick={() => setCurrentPage('WeatherSetting')}/>
              </Cog>
              <Location>{currentLocation.cityName}</Location>
              <Description>{weatherElement.description}</Description>
              <CurrentWeather>
                  <Temperature>
                  {weatherElement.temperature} <Celsius>°C</Celsius>
                  </Temperature>
                  <WeatherIcon
                    moment='day'
                  />
              </CurrentWeather>
              <AirFlow>
                <AirFlowIcon />
                {weatherElement.windSpeed} m/h
              </AirFlow>
              <Rain>
                <RainIcon/>
                {weatherElement.rainPossibility} %
              </Rain>
              <ReFresh onClick={fetchData} isLoading={weatherElement.isLoading}>
                最後觀測時間：
                {new Intl.DateTimeFormat('zh-TW', {
                hour: 'numeric',
                minute: 'numeric',
                }).format(new Date(weatherElement.observationTime))}{' '}
              {weatherElement.isLoading ? <LoadingIcon/>:<ReFreshIcon />}
              </ReFresh>
          </WeatherCard>
        }

        {currentPage=='WeatherSetting' && <WeatherSetting cityName={currentLocation.cityName} setCurrentPage={setCurrentPage} setCurrentCity={setCurrentCity}/>}
      </Container>
  )
};

export default WeatherApp;