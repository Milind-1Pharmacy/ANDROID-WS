import {Dimensions} from 'react-native';


const screenWidth = Dimensions.get('window').width;

const CarouselView = (props: any) => {
  return (
    <>
      {/* <Carousel
                layout="default"
                data={props.children}
                renderItem={({ item }: { item: any }) => item}
                sliderWidth={screenWidth}
                itemWidth={screenWidth - 40}
            /> */}
    </>
  );
};

export default CarouselView;
