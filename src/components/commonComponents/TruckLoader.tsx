import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Animated, Easing, Text} from 'react-native';
import Svg, {Path, Rect, Circle} from 'react-native-svg';

const TruckLoader = () => {
  const [loadingText, setLoadingText] = useState('Loading');
  const roadAnimation = new Animated.Value(0);

  useEffect(() => {
    // Animate the road
    const animateRoad = () => {
      roadAnimation.setValue(0);
      Animated.timing(roadAnimation, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(animateRoad);
    };
    animateRoad();

    // Animate the loading text dots
    const animateDots = setInterval(() => {
      setLoadingText(prev => {
        if (prev === 'Loading...') return 'Loading';
        if (prev === 'Loading..') return 'Loading...';
        if (prev === 'Loading.') return 'Loading..';
        return 'Loading.';
      });
    }, 500);

    return () => {
      clearInterval(animateDots);
    };
  }, []);

  const roadTranslateX = roadAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -350],
  });

  const truckBodyAnimation = new Animated.Value(0);
  Animated.loop(
    Animated.sequence([
      Animated.timing(truckBodyAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(truckBodyAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]),
  ).start();

  const truckTranslateY = truckBodyAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 3],
  });

  return (
    <View style={styles.loader}>
      <View style={styles.truckWrapper}>
        {/* Truck Body */}
        <Animated.View
          style={[
            styles.truckBody,
            {transform: [{translateY: truckTranslateY}]},
          ]}>
          <Svg width={198} height={93} viewBox="0 0 198 93">
            <Path
              strokeWidth="3"
              stroke="#282828"
              fill="#F83D3D"
              d="M135 22.5H177.264C178.295 22.5 179.22 23.133 179.594 24.0939L192.33 56.8443C192.442 57.1332 192.5 57.4404 192.5 57.7504V89C192.5 90.3807 191.381 91.5 190 91.5H135C133.619 91.5 132.5 90.3807 132.5 89V25C132.5 23.6193 133.619 22.5 135 22.5Z"
            />
            <Path
              strokeWidth="3"
              stroke="#282828"
              fill="#7D7C7C"
              d="M146 33.5H181.741C182.779 33.5 183.709 34.1415 184.078 35.112L190.538 52.112C191.16 53.748 189.951 55.5 188.201 55.5H146C144.619 55.5 143.5 54.3807 143.5 53V36C143.5 34.6193 144.619 33.5 146 33.5Z"
            />
            <Path
              strokeWidth="2"
              stroke="#282828"
              fill="#282828"
              d="M150 65C150 65.39 149.763 65.8656 149.127 66.2893C148.499 66.7083 147.573 67 146.5 67C145.427 67 144.501 66.7083 143.873 66.2893C143.237 65.8656 143 65.39 143 65C143 64.61 143.237 64.1344 143.873 63.7107C144.501 63.2917 145.427 63 146.5 63C147.573 63 148.499 63.2917 149.127 63.7107C149.763 64.1344 150 64.61 150 65Z"
            />
            <Rect
              strokeWidth="2"
              stroke="#282828"
              fill="#FFFCAB"
              rx="1"
              height="7"
              width="5"
              y="63"
              x="187"
            />
            <Rect
              strokeWidth="2"
              stroke="#282828"
              fill="#282828"
              rx="1"
              height="11"
              width="4"
              y="81"
              x="193"
            />
            <Rect
              strokeWidth="3"
              stroke="#282828"
              fill="#2e6acf"
              rx="2.5"
              height="90"
              width="121"
              y="1.5"
              x="6.5"
            />
            {/* Logo */}
            <Svg x="40" y="12" width="56" height="64" viewBox="0 0 56 83">
              <Path
                d="M55.0956 31.2156C54.6344 33.8673 53.8992 36.4106 52.7802 38.8456C50.9636 42.8013 48.3261 46.1222 44.9398 48.874C43.1148 50.3572 41.0692 51.4434 38.9692 52.4503L38.9546 52.4576L38.713 52.5722L38.2895 52.7723L38.028 52.8807V51.9093C38.0259 51.8217 38.0259 51.7331 38.027 51.6445C38.028 51.5549 38.0291 51.4663 38.0291 51.3766C38.0291 40.0849 38.0081 28.7932 38.0468 17.5004C38.0542 15.3615 37.4905 13.4655 36.2125 11.7821C35.2786 10.5501 34.0665 9.66197 32.6567 8.99279C30.9583 8.1881 29.1826 8.06927 27.3754 8.24126C25.5494 8.41533 23.941 9.22002 22.3973 10.1727C21.2438 10.8846 20.0579 11.5424 18.8876 12.2282C17.2499 13.1872 15.6163 14.1555 13.9754 15.1093C12.459 15.9911 10.9646 16.9177 9.4063 17.7224C5.75224 19.6091 3.94194 24.1172 4.72421 27.804C5.15718 29.8397 6.05971 31.5669 7.60541 32.9469C9.25675 34.4208 11.2417 34.7116 13.3898 34.6512C14.3404 34.6241 14.9543 34.5938 16.2062 34.1425C17.7592 33.3878 17.5532 33.3753 18.2371 33.0126L19.262 32.456V33.6088C19.2683 37.749 19.2641 41.8892 19.2787 46.0294C19.3112 54.8112 19.3237 63.594 19.4116 72.3747C19.4377 74.9316 18.4557 77.009 16.8849 78.9144C15.5473 80.5373 13.7642 81.5192 11.7813 81.8851C9.90829 82.2311 7.92857 82.3301 6.1235 81.3587C5.28162 80.9053 4.33726 80.5436 3.65748 79.9088C2.72671 79.0384 1.91412 78.0055 1.21238 76.937C0.209448 75.41 -0.00912557 73.661 0.000286718 71.8421C0.0368901 64.7739 0.0149296 57.7058 0.0149296 50.6376C0.0149296 43.6122 0.0316608 36.5858 0.00656132 29.5593C-0.00285097 27.0566 0.272198 24.5779 0.837981 22.1639C1.31592 20.1271 2.06995 18.1404 2.84489 16.1871C4.13856 12.9245 6.20089 10.1248 8.65541 7.65546C9.95326 6.3494 11.4979 5.26953 13.007 4.19383C14.7838 2.92634 16.7709 2.03096 18.85 1.36073C21.0273 0.659233 23.2591 0.196433 25.5463 0.0682241C28.0635 -0.0724926 30.5839 -0.021418 33.0604 0.468484C35.2179 0.894804 37.3367 1.49624 39.306 2.51357C40.3623 3.05976 41.4342 3.58614 42.4413 4.21259C44.6679 5.59578 46.679 7.24269 48.392 9.24087C49.8363 10.9243 51.2324 12.6629 52.1768 14.6621C53.0887 16.5936 53.9494 18.597 54.4598 20.6598C55.3142 24.112 55.72 27.6258 55.0956 31.2156Z"
                fill="white"
                fillOpacity="0.75"
              />
            </Svg>
            <Rect
              strokeWidth="2"
              stroke="#282828"
              fill="#DFDFDF"
              rx="2"
              height="4"
              width="6"
              y="84"
              x="1"
            />
          </Svg>
        </Animated.View>

        {/* Truck Tires */}
        <View style={styles.truckTires}>
          <Svg width={30} height={30} viewBox="0 0 30 30">
            <Circle
              strokeWidth="3"
              stroke="#282828"
              fill="#282828"
              r="13.5"
              cy="15"
              cx="15"
            />
            <Circle fill="#DFDFDF" r="7" cy="15" cx="15" />
          </Svg>
          <Svg width={30} height={30} viewBox="0 0 30 30">
            <Circle
              strokeWidth="3"
              stroke="#282828"
              fill="#282828"
              r="13.5"
              cy="15"
              cx="15"
            />
            <Circle fill="#DFDFDF" r="7" cy="15" cx="15" />
          </Svg>
        </View>

        {/* Road */}
        <View style={styles.road}>
          <Animated.View
            style={[
              styles.roadMark,
              {transform: [{translateX: roadTranslateX}]},
            ]}
          />
          <Animated.View
            style={[
              styles.roadMarkSmall,
              {transform: [{translateX: roadTranslateX}]},
            ]}
          />
        </View>

        {/* Lamp Post */}
        <Animated.View
          style={[
            styles.lampPost,
            {transform: [{translateX: roadTranslateX}]},
          ]}>
          <Svg width={453.459} height={453.459} viewBox="0 0 453.459 453.459">
            <Path
              d="M252.882,0c-37.781,0-68.686,29.953-70.245,67.358h-6.917v8.954c-26.109,2.163-45.463,10.011-45.463,19.366h9.993
c-1.65,5.146-2.507,10.54-2.507,16.017c0,28.956,23.558,52.514,52.514,52.514c28.956,0,52.514-23.558,52.514-52.514
c0-5.478-0.856-10.872-2.506-16.017h9.992c0-9.354-19.352-17.204-45.463-19.366v-8.954h-6.149C200.189,38.779,223.924,16,252.882,16
c29.952,0,54.32,24.368,54.32,54.32c0,28.774-11.078,37.009-25.105,47.437c-17.444,12.968-37.216,27.667-37.216,78.884v113.914
h-0.797c-5.068,0-9.174,4.108-9.174,9.177c0,2.844,1.293,5.383,3.321,7.066c-3.432,27.933-26.851,95.744-8.226,115.459v11.202h45.75
v-11.202c18.625-19.715-4.794-87.527-8.227-115.459c2.029-1.683,3.322-4.223,3.322-7.066c0-5.068-4.107-9.177-9.176-9.177h-0.795
V196.641c0-43.174,14.942-54.283,30.762-66.043c14.793-10.997,31.559-23.461,31.559-60.277C323.202,31.545,291.656,0,252.882,0z
M232.77,111.694c0,23.442-19.071,42.514-42.514,42.514c-23.442,0-42.514-19.072-42.514-42.514c0-5.531,1.078-10.957,3.141-16.017
h78.747C231.693,100.736,232.77,106.162,232.77,111.694z"
              fill="#000000"
            />
          </Svg>
        </Animated.View>
      </View>
      <View style={styles.loadingText}>
        <Text style={styles.loadingTextWord}>{loadingText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  truckWrapper: {
    width: 200,
    height: 100,
    flexDirection: 'column',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  truckBody: {
    width: 130,
    marginBottom: 6,
  },
  truckTires: {
    width: 130,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 10,
    position: 'absolute',
    bottom: 0,
  },
  road: {
    width: '100%',
    height: 1.5,
    backgroundColor: '#282828',
    position: 'relative',
    bottom: 0,
    alignSelf: 'flex-end',
    borderRadius: 3,
  },
  roadMark: {
    position: 'absolute',
    width: 20,
    height: '100%',
    backgroundColor: '#282828',
    right: '-50%',
    borderRadius: 3,
    borderLeftWidth: 10,
    borderLeftColor: 'white',
  },
  roadMarkSmall: {
    position: 'absolute',
    width: 10,
    height: '100%',
    backgroundColor: '#282828',
    right: '-65%',
    borderRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: 'white',
  },
  lampPost: {
    position: 'absolute',
    bottom: 0,
    right: '-90%',
    height: 90,
    width: 30,
  },
  loadingText: {
    marginTop: 8,
  },
  loadingTextWord: {
    fontWeight: '500',
    fontSize: 16,
  },
});

export default TruckLoader;
