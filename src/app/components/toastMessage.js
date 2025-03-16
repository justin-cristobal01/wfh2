import React from 'react'

function ToastMessage({toastMessage,toastStatus}) {
  return (
    <div className="toast">
    <div className={`alert ${toastStatus}`}>
      <span className='text-white'>{toastMessage}</span>
    </div>
  </div>
  )
}

export default ToastMessage;