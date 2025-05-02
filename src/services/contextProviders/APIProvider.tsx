import React, {useCallback, useState, useContext} from 'react';
import APIGet from '../APIHandler/APIGet';
import APIPost from '../APIHandler/APIPost';
import APIPut from '../APIHandler/APIPut';
import APIPatch from '../APIHandler/APIPatch';
import APIDelete from '../APIHandler/APIDelete';
import {AuthContext} from './AuthContextProvider';
import {P1AlertDialog} from '@commonComponents';
import P1Styles from '@P1StyleSheet';
import {Dimensions, StyleSheet} from 'react-native';
import {parseError} from '@helpers';
import {ToastContext} from './ToastHandler';
import ToastBaseProfiles from 'src/utils/ToastProfiles/common';
import {ToastProfiles} from '@ToastProfiles';

const styles = StyleSheet.create({
  logOutConfirmButton: {
    backgroundColor: '#2E6ACF',
    borderRadius: 20,
    ...P1Styles.shadow,
  },
});

const initialState = {
  APIGet: APIGet,
  APIPost: APIPost,
  APIPut: APIPut,
  APIPatch: APIPatch,
  APIDelete: APIDelete,
  statusCode: null,
};

export const APIContext = React.createContext<{
  APIGet: typeof APIGet;
  APIPost: typeof APIPost;
  APIPut: typeof APIPut;
  APIPatch: typeof APIPatch;
  APIDelete: typeof APIDelete;
  statusCode: number | null;
}>(initialState);

const APIContextProvider = (props: {children: React.ReactNode}) => {
  const [logOutDialogOpen, setLogOutDialogOpen] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null); // Store status code

  const toggleLogOutDialogOpen = () => setLogOutDialogOpen(!logOutDialogOpen);

  const {authStatus, userLogOut, expiredToken, invalidateToken} =
    useContext(AuthContext);

  const {showToast} = useContext(ToastContext);

  const check1001 = useCallback(
    (error: any, reject: Function | undefined) => {
      const parsedErrStatus = parseError(error).status;
      setStatusCode(parsedErrStatus);
      if (parsedErrStatus === 1001) {
        invalidateToken();
        toggleLogOutDialogOpen();
      } else if (parsedErrStatus === 401 && !expiredToken) {
        showToast({
          ...ToastProfiles.error,
          title: 'Your session has expired. \nPlease login again.',
          id: 'dashboard-fetch-error',
          timeLimit: 3500,
          origin: 'top',
        });
        userLogOut();
        invalidateToken();
      } else {
        reject && reject(error);
      }
    },
    [expiredToken, invalidateToken, userLogOut],
  );

  const createReject = useCallback(
    (reject: Function | undefined) => {
      return (error: any) => {
        check1001(error, reject);
      };
    },
    [check1001],
  );

  return (
    <APIContext.Provider
      value={{
        APIGet: ({url, resolve, reject}) =>
          APIGet({
            url,
            resolve,
            reject: createReject(reject),
            customHeaders: {'session-token': authStatus.user?.sessionToken},
          }),
        APIPost: ({url, body, resolve, reject}) =>
          APIPost({
            url,
            body,
            resolve,
            reject: createReject(reject),
            customHeaders: {'session-token': authStatus.user?.sessionToken},
          }),
        APIPut: ({url, body, resolve, reject}) =>
          APIPut({
            url,
            body,
            resolve,
            reject: createReject(reject),
            customHeaders: {'session-token': authStatus.user?.sessionToken},
          }),
        APIPatch: ({url, body, resolve, reject}) =>
          APIPatch({
            url,
            body,
            resolve,
            reject: createReject(reject),
            customHeaders: {'session-token': authStatus.user?.sessionToken},
          }),
        APIDelete: ({url, body, resolve, reject}) =>
          APIDelete({
            url,
            body,
            resolve,
            reject: createReject(reject),
            customHeaders: {'session-token': authStatus.user?.sessionToken},
          }),
        statusCode,
      }}>
      {props.children}
      <P1AlertDialog
        heading="Session Expired"
        body="Your session has expired. Please login again."
        isOpen={logOutDialogOpen}
        toggleOpen={toggleLogOutDialogOpen}
        dismissable={false}
        buttons={[
          {
            label: 'Proceed to Login',
            variant: 'solid',
            style: {...styles.logOutConfirmButton, backgroundColor: '#D00000'},
            action: () => userLogOut().then(toggleLogOutDialogOpen),
          },
        ]}
      />
    </APIContext.Provider>
  );
};

export default APIContextProvider;
