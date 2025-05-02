import React, {useContext} from 'react';
import {getURL} from '@APIRepository';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {ScreenBase} from '@Containers';
import {AuthContext} from '@contextProviders';
import SearchWithCounter from '../../../commonComponents/SearchWithCounter';
const SearchTabPanel = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {storeId} = useContext(AuthContext);
  const generateSearchURL = (searchKeyword: string) =>
    getURL({
      key: 'SEARCH_PRODUCT',
      pathParams: storeId || '',
      queryParams: {search: searchKeyword},
    });

  return (
    <ScreenBase>
      <SearchWithCounter
        navigation={navigation}
        placeholder="Find your feel-good here"
        searchURLGenerator={generateSearchURL}
        itemsParser={(responseData: any) => responseData?.products || []}
      />
    </ScreenBase>
  );
};

export default SearchTabPanel;
