import React, { use, useEffect } from 'react'
import font from '../../styles/Fonts.module.css';
import Image from 'next/image';
import Link from 'next/link';
import download from '../../public/assets/icons/download.svg';
import audioFile from '../../public/assets/icons/file-icons/audio.svg';
import excelFile from '../../public/assets/icons/file-icons/excel.svg';
import imageFile from '../../public/assets/icons/file-icons/image.svg';
import pdfFile from '../../public/assets/icons/file-icons/pdf.svg';
import pptFile from '../../public/assets/icons/file-icons/ppt.svg';
import documentFile from '../../public/assets/icons/file-icons/txt.svg';
import videoFile from '../../public/assets/icons/file-icons/video.svg';
import wordFile from '../../public/assets/icons/file-icons/word.svg';

export default function FilePreview({name, size, fileUrl, username, nickname}) {

    const [fileImage, setFileImage] = React.useState('');
    useEffect(() => {
        if(name.includes('.pdf')) {
            setFileImage(pdfFile)
        } else if(name.includes('.doc') || name.includes('.docx')) {
            setFileImage(wordFile)
        } else if(name.includes('.xls') || name.includes('.xlsx')) {
            setFileImage(excelFile)
        } else if(name.includes('.ppt') || name.includes('.pptx')) {
            setFileImage(pptFile)
        } else if(name.includes('.mp3') || name.includes('.wav') || name.includes('.flac')) {
            setFileImage(audioFile)
        } else if(name.includes('.mp4') || name.includes('.avi') || name.includes('.mkv')) {
            setFileImage(videoFile)
        } else if(name.includes('.jpg') || name.includes('.jpeg') || name.includes('.png') || name.includes('.gif')) {
            setFileImage(imageFile)
        } else {
            setFileImage(documentFile)
        }
    } , [name])

    
    return (
        <React.Fragment>
            <article className="p-2 bg-gray-50 -mt-5 w-80 h-36 rounded overflow-hidden shadow-lg" style={{ border: '1px solid white' }}>
                <div className='flex justify-around gap-5'>
                    <Image style={{ objectFit: 'contain', width: '60px', height: '60px' }} className="w-full" src={fileImage} alt="image" />
                    <p className={`self-end text-gray-900 text-xl ${font.poppinsSemiBold}`}> {name} </p>
                </div>
                <div className="px-6 py-4 flex gap-3 justify-between">
                    <p className={`text-green-500 text-base ${font.poppinsSemiBold}`}> {Math.trunc(size / 1024)} MB </p>
                    <Link href={fileUrl === 'empty' ? `http://localhost:8000/uploads/${name}` : fileUrl} download className="float-right text-blue-500 text-base hover:underline self-end"> <Image src={download} alt='download icon' width={20} height={20} className={`${username === nickname ? 'mt-1' : '-mt-6'}`} /> </Link>
                </div>
            </article>
        </React.Fragment>
    );
}
