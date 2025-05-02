import {
  getStoreConfig,
  getUserSessionData,
  logOut,
  setLocalStoreConfig,
  setLocalStoreId,
  setUserData,
} from '@auth';
import {LoadingScreen} from '@commonComponents';
import React, {ReactNode, createContext, useEffect, useState} from 'react';
import {UserRoleAlias, UserRoles} from '@Constants';

type AuthStatus = {
  loggedIn: boolean;
  user: any;
};

type ContextState = {
  authStatus: AuthStatus;
  setLoggedInUser: Function;
  userLogOut: Function;
  localAuthFetched: boolean;
  expiredToken: boolean;
  invalidateToken: Function;
  storeId: string | null;
  storeConfig: any;
  setStoreId: Function;
  setStoreConfig: Function;
  appMode: keyof UserRoles;
  setAppMode: Function;
};

const initialState: ContextState = {
  authStatus: {
    loggedIn: false,
    user: null,
  },
  setLoggedInUser: (userData: any) => {},
  userLogOut: () => {},
  localAuthFetched: false,
  expiredToken: false,
  invalidateToken: () => {},
  storeId: null,
  storeConfig: {},
  setStoreId: () => {},
  setStoreConfig: () => {},
  appMode: UserRoleAlias.CUSTOMER,
  setAppMode: () => {},
};

export const AuthContext = createContext(initialState);

const AuthContextProvider = (props: {children: ReactNode}) => {
  const [authStatus, setAuthStatus] = useState(initialState.authStatus);
  const [localAuthFetched, setLocalAuthFetched] = useState(false);
  const [expiredToken, setExpiredToken] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeConfig, setStoreConfig] = useState<any>(null);
  const [appMode, setAppMode] = useState<keyof UserRoles>(
    UserRoleAlias.CUSTOMER,
  );

  useEffect(() => {
    getUserSessionData().then(userData => {
      if (!!userData) {
        setAuthStatus({
          loggedIn: userData.loggedIn,
          user: userData.userData,
        });
        // APP MODE HANDLE
        setAppMode(userData.userData.userType || UserRoleAlias.CUSTOMER);
      }
      getStoreConfig()
        .then((response: {storeId: string | null; config: any} | null) => {
          setStoreId(response?.storeId as string);
          setStoreConfig(response?.config as string);
          setLocalAuthFetched(true);
        })
        .catch(() => setLocalAuthFetched(true));
    });
  }, []);

  useEffect(() => {
    setLocalStoreId(storeId || '');
    setLocalStoreConfig(storeConfig || {});
  }, [storeId, storeConfig]);

  const setLoggedInUser = (userData: any, onComplete: Function = () => {}) => {
    setUserData(userData).then(userData => {
      setAuthStatus({
        loggedIn: true,
        user: userData,
      });
      onComplete();
    });

    // APP MODE HANDLE
    setAppMode(userData.userType || UserRoleAlias.CUSTOMER);

    setExpiredToken(false);
  };

  const userLogOut = async () => {
    return logOut().then(() => {
      setAuthStatus(initialState.authStatus);
      // APP MODE HANDLE
      setAppMode(UserRoleAlias.CUSTOMER);
    });
  };

  const invalidateToken = () => {
    setExpiredToken(true);
  };

  return (
    <AuthContext.Provider
      value={{
        authStatus,
        setLoggedInUser,
        userLogOut,
        localAuthFetched,
        expiredToken,
        invalidateToken,
        storeId,
        storeConfig,
        setStoreConfig,
        setStoreId,
        appMode,
        setAppMode,
      }}>
      {localAuthFetched ? props.children : <LoadingScreen />}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
