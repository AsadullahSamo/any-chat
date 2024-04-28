import React, { useEffect, useState } from 'react';
import font from '../../styles/Fonts.module.css';

export default function Card( { siteUrl, messagePart, name, nickname } ) {

    const [dataFetched, setDataFetched] = useState(true);
    const [loading, setLoading] = useState(true); 
    const [dataFromApi, setDataFromApi] = useState({url: '', title: '', description: '', images: [], favicon: '', sitename: ''});

    // Custom api in case of api limit reached
    useEffect(() => {
        if(!dataFetched) {
            setLoading(true);
            fetch(`http://localhost:8000/scrape?url=${siteUrl}`)
                .then(res => res.json())
                .then(data => {
                    setDataFromApi({...data, images: data.image});
                    setLoading(false);
            })
            .catch(error => {
                console.error('An error occurred:', error);
                setLoading(false);
            });
        }
    }, []);
    
    // Fetch data from localStorage and if data is not in localStorage (new link) fetch from jsonlink api
    useEffect(() => {
        let urls = new Map(JSON.parse(localStorage.getItem("urls")))
        if(urls && urls.has(siteUrl)) {
            setDataFromApi(urls.get(siteUrl))
            setLoading(false);
        } else {
            const apiKey = 'pk_379542c22162196f7598828469e2bc938ccdf938';
            const url = siteUrl;
            const apiUrl = `https://jsonlink.io/api/extract?url=${url}&api_key=${apiKey}`;
            
            fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    setDataFetched(false);
                    setLoading(false);
                    throw new Error(`Error: ${response.status} - ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                setLoading(false);
                setDataFromApi(data);
                const newUrlsMap = urls ? new Map(urls.entries()) : new Map();
                newUrlsMap.set(siteUrl, data);  
                localStorage.setItem("urls", JSON.stringify(Array.from(newUrlsMap.entries())));
            })
            .catch(error => {
                console.error('An error occurred:', error);
                setDataFetched(false);
            });
        }
    }, [dataFetched, siteUrl]);

    return (
        <article className="-mt-5 md:max-w-sm rounded overflow-hidden shadow-lg" style={{border: '1px solid white'}}>
            {messagePart && messagePart.length > 0 && <p className={`bg-[#EDF0F8] break-words text-center ${font.poppinsMedium}`}>{messagePart}</p>  }
            {loading ? (
                <div>Loading...</div>
            ) : (
            <>
            <a href={dataFromApi.url} target='_blank' rel="noopener noreferrer">
                <img className="w-full" src={dataFromApi.images.length > 0 ? dataFromApi.images[0] : ''} alt="image" />
            </a>
            <div className="px-6 py-4">
                <h2 className={`font-bold text-xl mb-2 ${font.poppinsMedium}`}>{dataFromApi.title}</h2>
                <p className={`text-gray-700 text-base ${font.poppinsRegular}`}>
                    {dataFromApi.description}
                </p>
            </div>
            <div className="flex gap-2 mx-5 my-2">
                <img src={dataFromApi.favicon} alt="Favicon" style={{ objectFit: "cover" }} />
                <a href={dataFromApi.url} target="_blank" rel="noopener noreferrer" className={`${font.poppinsRegular}`}>
                    {dataFromApi.sitename}
                </a>
            </div>
            </>
            )}
        </article>
    );
}
