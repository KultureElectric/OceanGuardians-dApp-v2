import { useEffect } from 'react'
import { XIcon } from '@heroicons/react/solid'
import useNotificationStore from '../stores/useNotificationStore'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCircleXmark, faCircleCheck, faCircleInfo } from '@fortawesome/free-solid-svg-icons';

const NotificationList = () => {
  const { notifications, set: setNotificationStore } = useNotificationStore(
    (s) => s
  )

  const reversedNotifications = [...notifications].reverse()
  
  if (reversedNotifications[0]) {
    return (
      <div className={`z-20 fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6`}>
        <div className={`flex flex-col w-full`}>
          <Notification
            key={`${reversedNotifications[0].message}`}
            type={reversedNotifications[0].type}
            message={reversedNotifications[0].message}
            description={reversedNotifications[0].description}
            txid={reversedNotifications[0].txid}
            onHide={() => {
              setNotificationStore((state: any) => {
                const reversedIndex = reversedNotifications.length - 1;
                state.notifications = [
                  ...notifications.slice(0, reversedIndex),
                  ...notifications.slice(reversedIndex + 1),
                ];
              });
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`z-20 fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6`}
    >
      <div className={`flex flex-col w-full`}>
        {reversedNotifications.map((n, idx) => (
          <Notification
            key={`${n.message}${idx}`}
            type={n.type}
            message={n.message}
            description={n.description}
            txid={n.txid}
            onHide={() => {
              setNotificationStore((state: any) => {
                const reversedIndex = reversedNotifications.length - 1 - idx;
                state.notifications = [
                  ...notifications.slice(0, reversedIndex),
                  ...notifications.slice(reversedIndex + 1),
                ];
              });
            }}
          />
        ))}
      </div>
    </div>
  );
}

const Notification = ({ type, message, description, txid, onHide }) => {

  useEffect(() => {
    const id = setTimeout(() => {
      onHide()
    }, 10000);

    return () => {
      clearInterval(id);
    };
  }, [onHide]);

  return (
    <div
      className={`max-w-sm w-full bg-header rounded mt-2 pointer-events-auto p-2 mx-4 mb-4 overflow-hidden`}
    >
      <div className={`p-4`}>
        <div className={`flex items-center`}>
          <div className={`flex-shrink-0`}>
            {type === 'success' ? (
              <FontAwesomeIcon icon={faCircleCheck}/>
            ) : null}
            {type === 'info' && <FontAwesomeIcon icon={faCircleInfo}/>}
            {type === 'error' && <FontAwesomeIcon icon={faCircleXmark}/>}
            {type === 'loading' && <FontAwesomeIcon className='animate-spin' icon={faSpinner}/>}
          </div>
          <div className={`ml-2 w-0 flex-1`}>
            <div className={`font-bold text-fgd-1`}>{message}</div>
            {description ? (
              <p className={`mt-0.5 text-sm text-fgd-2`}>{description}</p>
            ) : null}
            {txid ? (
              <div className="flex flex-row mt-2 text-xs">
         
                <a
                  href={'https://solscan.io/tx/' + txid + `?cluster=${process.env.NEXT_PUBLIC_CLUSTER}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-row link link-accent"
                >
                  <svg className="flex-shrink-0 h-4 text-primary-light w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" ><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  <div className="flex mx-2">{txid.slice(0, 8)}...
                    {txid.slice(txid.length - 8)}
                  </div>
                </a>
              </div>
            ) : null}
          </div>
          <div className={`ml-4 flex-shrink-0 self-start flex`}>
            <button
              onClick={() => onHide()}
              className={`bg-bkg-2 default-transition rounded-md inline-flex text-fgd-3 hover:text-fgd-4 focus:outline-none`}
            >
              <span className={`sr-only`}>Close</span>
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationList
