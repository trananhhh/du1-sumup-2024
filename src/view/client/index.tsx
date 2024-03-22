import { onValue, push, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

import { fbRealtime } from '../../../firebase.config';
import Confetti from 'react-confetti';

import bgImage from '../../assets/bg-img.png';

const bgColorList = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-purple-500',
  'bg-indigo-500',
  'bg-gray-500',
  'bg-black',
  'bg-white',
];

const Client = () => {
  const du1Ldap = localStorage.getItem('DU1_SUMUP_LDAP_KEY');

  const [bgColor, setBgColor] = useState('bg-white');
  const [isDrawing, setIsDrawing] = useState<0 | 1 | 2>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLucky, setIsLucky] = useState<boolean | undefined>(false);
  const [ldap, setLdap] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setBgColor(() => {
        const randomIndex = Math.floor(Math.random() * bgColorList.length);
        return bgColorList[randomIndex];
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const drawingRef = ref(fbRealtime, 'lucky');

    return onValue(drawingRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        setIsDrawing(data?.drawing);
        return;
      }
      setIsDrawing(0);
    });
  }, []);

  useEffect(() => {
    const drawingRef = ref(fbRealtime, 'member/' + du1Ldap);

    return onValue(drawingRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        setIsLucky(data?.isLucky);
        return;
      }
      setIsDrawing(0);
    });
  }, [du1Ldap]);

  const onSubmit = async () => {
    const du1Ldap = localStorage.getItem('DU1_SUMUP_LDAP_KEY');
    console.log('du1Ldap', du1Ldap);

    // if (!du1Ldap) {
    push(ref(fbRealtime, 'member'), { ldap: ldap })
      .then((res) => {
        if (res?.key) localStorage.setItem('DU1_SUMUP_LDAP_KEY', res?.key);
        console.log('res?.key', res?.key);
      })
      .catch((error) => {
        console.log(error);
      });
    // }

    setIsSubmitted(true);
  };

  const render = () => {
    switch (true) {
      case !isSubmitted && isDrawing === 0:
        return (
          <div className='flex flex-col justify-center items-center bg-slate-100 h-fit w-full p-4 rounded-md gap-4'>
            <input
              value={ldap}
              onChange={(e) => setLdap(e.target.value)}
              className='w-full p-3 rounded-md text-sm'
              placeholder='Nhập LDAP của bạn...'
            />
            <button
              disabled={!ldap}
              onClick={() => onSubmit()}
              className='bg-zinc-700 px-4 py-2 rounded-md w-full text-yellow-500'
            >
              Bắt đầu 🎉
            </button>
          </div>
        );

      case isSubmitted && isDrawing === 1:
        return (
          <div className='flex flex-col text-center p-5 rounded-md w-full h-1/3 items-center justify-center animate-pulse'>
            <span className='text-[120px]'>🎰</span>
            {/* <h1>Đang quay số...</h1> */}
          </div>
        );

      case isDrawing === 2 && isLucky === true:
        return (
          <div className='flex flex-col text-center bg-slate-100/80 p-5 rounded-md w-full h-1/3 items-center justify-center'>
            <span className='text-[120px] animate-bounce'>🎁</span>
            <h1>Xin chúc mừng, người may mắn là bạn!</h1>
            <Confetti width={500} height={2000} />
          </div>
        );

      case isDrawing === 2 && !isLucky:
        return (
          <div className='flex flex-col text-center bg-slate-100/80 p-5 rounded-md w-full h-1/3 items-center justify-center'>
            <span className='text-[120px]'>🍀</span>
            <h1>Chúc bạn may mắn lần sau! 🥹</h1>
          </div>
        );

      default:
        return (
          <div className='flex flex-col text-center bg-slate-100/80 p-5 rounded-md w-full h-1/3 items-center justify-center'>
            <span className='text-[120px]'>🎉</span>
            <h1>Vui lòng đợi trong giây lát...</h1>
          </div>
        );
    }
  };

  return (
    <div
      className={
        'h-screen w-screen flex items-center justify-center flex-col ' +
        (isDrawing === 1 ? bgColor : 'bg-zinc-900')
      }
    >
      <div
        className='max-w-md w-full h-full flex items-center justify-center bg-cover bg-center p-4'
        style={
          isDrawing === 1
            ? { backgroundImage: `url(${bgImage})`, opacity: 0.7 }
            : { backgroundImage: `url(${bgImage})`, opacity: 1 }
        }
      >
        <div className='max-w-md w-full'>{render()}</div>
      </div>
    </div>
  );
};

export default Client;
