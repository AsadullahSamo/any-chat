import React, { useEffect, useState } from 'react';
import logo from '../../public/assets/icons/logo.svg';
import font from '../../styles/Fonts.module.css';

export default function Card( { siteUrl, messagePart, name, nickname } ) {

   
    const [loading, setLoading] = useState(true); 
    const [image, setImage] = useState(logo);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [favicon, setFavicon] = useState('');
    const [siteName, setSiteName] = useState('');
    const [url, setUrl] = useState('');

    useEffect(() => {
        setLoading(true);
        fetch(`http://localhost:8000/scrape?url=${siteUrl}`)
        .then(res => res.json())
        .then(data => {
          setImage(data.image);
          setTitle(data.title);
          setDescription(data.description);
          setFavicon(data.favicon);
          setSiteName(data.siteName);
          setUrl(data.url);
          setLoading(false);
        })
        .catch(error => {
          console.error('An error occurred:', error);
          setLoading(false);
        });
    }, [siteUrl]);

    // useEffect(() => {
    //     const apiKey = 'pk_379542c22162196f7598828469e2bc938ccdf938';
    //     const url = siteUrl;
    //     const apiUrl = `https://jsonlink.io/api/extract?url=${url}&api_key=${apiKey}`;

    //     fetch(apiUrl)
    //         .then(response => {
    //             if (!response.ok) {
    //                 throw new Error(`Error: ${response.status} - ${response.statusText}`);
    //             }
    //             return response.json();
    //         })
    //         .then(data => {
    //             setImage(data.images[0]);
    //             setTitle(data.title);
    //             setDescription(data.description);
    //             setFavicon(data.favicon);
    //             setSiteName(data.sitename);
    //             setUrl(data.url);
    //         })
    //         .catch(error => {
    //             console.error('An error occurred:', error);
    //         });
    // }, []);

    return (
        <article className="-mt-5 md:max-w-sm rounded overflow-hidden shadow-lg" style={{border: '1px solid white'}}>
            {messagePart && messagePart.length > 0 && <p className={`bg-[#EDF0F8] break-words text-center ${font.poppinsMedium}`}>{messagePart}</p>  }
            {loading ? (
                <div>Loading...</div> // Placeholder UI while loading
            ) : (
            <>
            <a href={url} target='_blank' rel="noopener noreferrer">
                <img className="w-full" src={image} alt="image" />
            </a>
            <div className="px-6 py-4">
                <h2 className={`font-bold text-xl mb-2 ${font.poppinsMedium}`}>{title}</h2>
                <p className={`text-gray-700 text-base ${font.poppinsRegular}`}>
                    {description}
                </p>
            </div>
            <div className="flex gap-2 mx-5 my-2">
                <img src={favicon} alt="Favicon" style={{ objectFit: "cover" }} />
                <a href={url} target="_blank" rel="noopener noreferrer" className={`${font.poppinsRegular}`}>
                    {siteName}
                </a>
            </div>
            </>
            )}
        </article>
    );
}
