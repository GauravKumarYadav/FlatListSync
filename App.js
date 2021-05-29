import React, { useEffect, useRef, useState } from 'react';
import {
	StatusBar,
	FlatList,
	Image,
	View,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
} from 'react-native';

import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


const API_KEY = "563492ad6f91700001000001914f5f6c82b442c18f3f1e85393b09e4"
const API_URL = "https://api.pexels.com/v1/search?query=nature&orientation=portrait&size=small&per_page=20";

const fetchImagesFromPixel = async () => {
	const data = await fetch(API_URL, {
		headers: {
			'Authorization': API_KEY,
		}
	})
	const { photos } = await data.json();
	return photos;
}


const width = wp('100%')
const height = hp('100%') + StatusBar.currentHeight;
const IMAGE_SIZE = wp('20%');
const SPACING = wp('2%');

export default () => {
	const [images, setImages] = useState([]);
	const [activeIndex, setActiveIndex] = useState(0);
	const topRef = useRef();
	const bottomRef = useRef();

	useEffect(() => {
		const fetchImages = async () => {
			const images = await fetchImagesFromPixel();
			setImages(images)
		};
		fetchImages();
	}, []);

	const scrollToActiveIndex = (index) => {
		setActiveIndex(index);
		topRef?.current?.scrollToOffset({
			offset: index * (width),
			animated: true,
		});

		if (index * IMAGE_SIZE + wp('2%') - IMAGE_SIZE / 2 > width / 2) {
			bottomRef?.current?.scrollToOffset({
				offset: index * (IMAGE_SIZE + SPACING) - width / 2 + IMAGE_SIZE / 2,
				animated: true,
			});
		} else {
			bottomRef?.current?.scrollToOffset({
				offset: 0,
				animated: true,
			});
		}
	}

	return (
		<View style={{ flex: 1 }}>
			<View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', backgroundColor: 'black' }]} >
				<ActivityIndicator size="large" color='white' />
			</View>
			<FlatList
				data={images}
				keyExtractor={item => item.id.toString()}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				ref={topRef}
				onMomentumScrollEnd={(ev) => {
					scrollToActiveIndex(Math.round(ev.nativeEvent.contentOffset.x / width))
				}}
				renderItem={({ item, index }) => {
					return (
						<View style={{ width, height }} >
							<View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', backgroundColor: 'black' }]} >
								<ActivityIndicator size="large" color='white' />
							</View>
							<Image
								source={{ uri: item.src.portrait }}
								style={StyleSheet.absoluteFillObject}
							/>
						</View>
					);
				}}
			/>

			<FlatList
				data={images}
				keyExtractor={item => item.id.toString()}
				ref={bottomRef}
				showsHorizontalScrollIndicator={false}
				horizontal
				contentContainerStyle={{ paddingHorizontal: SPACING }}
				style={{ position: 'absolute', bottom: IMAGE_SIZE }}
				renderItem={({ item, index }) => {
					return (
						<TouchableOpacity
							onPress={() => { scrollToActiveIndex(index) }}
						>
							<Image
								source={{ uri: item.src.portrait }}
								style={{ width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: wp('3%'), marginRight: SPACING, borderWidth: 2, borderColor: Math.floor(activeIndex) === index ? 'white' : 'transparent', }}
							/>
						</TouchableOpacity>
					);
				}}
			/>
		</View >
	);
};
