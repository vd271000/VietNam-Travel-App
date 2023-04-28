import React, { useState } from "react";
import { Text, View, Image} from "react-native";
import { images} from '../constants/'
import AppIntroSlider from "react-native-app-intro-slider";

const slides = [
    {
        key: "one",
        title: "TRAVEL VIETNAM",
        text: "Vietnam owns hundreds of tourist destinations including experiential tourism (Ha Noi, Ho Chi Minh,...) and resort tourism (Phu Quoc, Da Nang) with beautiful and majestic scenery.",
        image: images.onboarding1
    },
    {
        key: "two",
        title: "Flights",
        text: "Easily travel further with flight booking service with Vietnamese airlines",
        image: images.flight1
    },
    {
        key: "three",
        title: "Car rental",
        text: "Feel free to move freely with carpooling services across the country",
        image: images.car1
    },
    {
        key: "four",
        title: "HOTELS",
        text: "Safe accommodation with reputable and quality guesthouses and hotels ranging from affordable to high-end.",
        image: images.onboarding3
    },
    {
        key: "five",
        title: "RESTAURANTS",
        text: "Search for restaurants easily with hundreds of different restaurants across the country",
        image: images.onboarding4
    }
]

function Welcome(props) {
    //navigation
    const { navigation, route } = props
    //function of navigate to/back
    const { navigate, goBack } = navigation

    const onDone = () => {
        navigation.navigate('UITabs');
    };
    const onSkip = () => {
        navigation.navigate('UITabs');
    }

    const [showHomePage, setShowHomePage] = useState(false);

    const _renderItem = ({ item }) => {
        return (
            <View style={{ flex: 1 }}>
                <Image source={item.image}
                    style={{
                        resizeMode: "cover",
                        height: '73%',
                        width: "100%"
                    }}
                />
                <Text
                    style={{
                        paddingTop: 25,
                        paddingBottom: 10,
                        fontSize: 23,
                        fontWeight: 'bold',
                        color: '#21465b',
                        alignSelf: 'center'
                    }}
                >{item.title}</Text>
                <Text
                    style={{
                        textAlign: 'center',
                        color: '#b5b5b5',
                        fontSize: 15,
                        paddingHorizontal: 30
                    }}
                >{item.text}</Text>
            </View>
        );
    }

    return (
        <AppIntroSlider
        renderItem={_renderItem}
        data={slides}
        nextLabel=""
        onDone={onDone}
        showSkipButton={true}
        onSkip={onSkip}
        activeDotStyle={{
            backgroundColor: '#21465b',
            width: 30,
        }}
        dotStyle={{
            backgroundColor: '#000',
        }}
        skipLabel={<Text style={{color: '#000'}}>Skip</Text>}
        doneLabel={<Text style={{color: '#000'}}>Done</Text>}
    />
    
    );
}

export default Welcome;
