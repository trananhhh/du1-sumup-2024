import { onValue, ref, set } from 'firebase/database';
import { useEffect, useState } from 'react';
import { fbRealtime } from '../../../firebase.config';

const Admin = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [memberList, setMemberList] = useState<{ key: string; ldap: string }[]>(
    []
  );

  console.log('memberList', memberList);

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
    const memberRef = ref(fbRealtime, 'member');
    return onValue(memberRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();

        console.log('data', data);

        const _membetList = Object.keys(data).map((key) => ({
          key,
          ldap: data?.[key]?.ldap,
        }));

        setMemberList(_membetList);
        return;
      }
      setIsDrawing(false);
    });
  }, []);

  const handleDraw = async (_isDrawing: boolean) => {
    await set(ref(fbRealtime, 'lucky/'), { drawing: _isDrawing });

    if (!_isDrawing) {
      const _randomMembers = memberList
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);

      _randomMembers.forEach(async (member) => {
        await set(ref(fbRealtime, `member/${member?.key}`), {
          isLucky: true,
          ldap: member?.ldap,
        });
      });
    }
  };

  return (
    <div className='h-screen w-screen flex justify-center items-center flex-col p-4 pt-40'>
      <h2 className='font-bold text-2xl mb-4'>
        Đã có {memberList?.length} người tham gia
      </h2>

      <button
        onClick={() => handleDraw(!isDrawing)}
        className='bg-slate-200 px-4 py-2 rounded-md w-full'
      >
        {!isDrawing ? 'Start Draw' : 'Stop Drawing'}
      </button>

      <div className='bg-slate-100 w-full p-4 rounded-md mt-4 overflow-y-auto text-center'>
        {memberList?.map((member) => (
          <div key={member?.key}>{member?.ldap}</div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
