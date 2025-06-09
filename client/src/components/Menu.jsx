
const Menu = ({createRoom,joinRoom}) => {
  return (
    <div className='flex gap-3 items-center'>
        <button onClick={createRoom} className='bg-white hover:bg-gray-300 cursor-pointer text-gray-800 px-6 font-semibold py-3 rounded-lg shadow-lg transition-all'>Create Room</button>
        <button onClick={joinRoom} className='bg-yellow-500 hover:bg-yellow-600 cursor-pointer text-gray-800 px-6 font-semibold py-3 rounded-lg shadow-lg transition-all'>Join Room</button>
       
    </div>
  )
}

export default Menu