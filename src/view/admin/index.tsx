import { onValue, ref, set } from 'firebase/database';
import { useEffect, useState } from 'react';
import { fbRealtime } from '../../../firebase.config';

const Admin = () => {
  const [isDrawing, setIsDrawing] = useState<0 | 1 | 2>(0);
  const [memberList, setMemberList] = useState<{ key: string; ldap: string }[]>(
    []
  );

  const [luckyMember, setLuckyMember] = useState<
    { key: string; ldap: string }[]
  >([]);

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
    const memberRef = ref(fbRealtime, 'member');
    return onValue(memberRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();

        const _membetList = Object.keys(data).map((key) => ({
          key,
          ldap: data?.[key]?.ldap,
        }));

        setMemberList(_membetList);
        return;
      }
      setIsDrawing(0);
    });
  }, []);

  const handleDraw = async (_isDrawing: number) => {
    await set(ref(fbRealtime, 'lucky/'), { drawing: _isDrawing });

    if (!_isDrawing) {
      const _randomMembers = memberList
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);

      setLuckyMember(_randomMembers);

      _randomMembers.forEach(async (member) => {
        await set(ref(fbRealtime, `member/${member?.key}`), {
          isLucky: true,
          ldap: member?.ldap,
        });
      });
    }
  };

  return (
    <div className='h-screen w-screen flex justify-center items-center flex-col p-4 max-w-lg mx-auto bg-gray-900 '>
      <h2 className='font-bold text-2xl mb-4 text-white'>
        Đã có {memberList?.length} người tham gia
      </h2>

      <button
        onClick={() => handleDraw(isDrawing + 1)}
        className='bg-slate-200 px-4 py-2 rounded-md w-full'
      >
        {!isDrawing ? 'Start Draw' : 'Stop Drawing'}
      </button>

      <div className='bg-slate-100 w-full p-4 rounded-md mt-4 overflow-y-auto text-center'>
        {luckyMember?.map((member) => (
          <div key={member?.key}>{member?.ldap}</div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
