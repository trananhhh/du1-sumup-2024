import { onValue, push, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

import { fbRealtime } from '../../../firebase.config';
import Confetti from 'react-confetti';

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
  const [bgColor, setBgColor] = useState('bg-white');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLucky, setIsLucky] = useState(false);
  const [ldap, setLdap] = useState('');
  // const { width, height } = useWindowSize();

  const du1Ldap = localStorage.getItem('DU1_SUMUP_LDAP_KEY');

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
      setIsDrawing(false);
    });
  }, []);

  useEffect(() => {
    const drawingRef = ref(fbRealtime, 'member/' + du1Ldap);

    return onValue(drawingRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        console.log('data', data);
        setIsLucky(data?.isLucky);
        return;
      }
      setIsDrawing(false);
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

  return (
    <div
      className={
        'h-screen w-screen flex items-center justify-center flex-col p-4 ' +
        (isDrawing && isSubmitted ? bgColor : 'bg-gray-900')
      }
    >
      {!isSubmitted && !isLucky && (
        <div className='flex flex-col justify-center items-center bg-slate-100 h-fit w-full p-4 rounded-md gap-4'>
          <input
            value={ldap}
            onChange={(e) => setLdap(e.target.value)}
            className='w-full p-3 rounded-md text-sm'
            placeholder='Nhập LDAP của bạn...'
          />
          <button
            onClick={() => onSubmit()}
            className='bg-red-500 text-white px-4 py-2 rounded-md w-full'
          >
            Bắt đầu 🎉
          </button>
        </div>
      )}

      {isLucky && (
        <div className='flex flex-col text-center bg-slate-100/80 p-5 rounded-md w-full h-1/3 items-center justify-center'>
          <span className='text-[120px]'>🎁</span>
          <h1>Xin chúc mừng, người may mắn là bạn!</h1>
          <Confetti width={500} height={2000} />
        </div>
      )}
    </div>
  );
};

export default Client;
