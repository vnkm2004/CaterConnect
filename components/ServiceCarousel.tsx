import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    FlatList,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
    runOnJS,
    SharedValue,
} from "react-native-reanimated";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const DUMMY_DATA = [
    {
        id: "1",
        name: "Wedding Catering",
        image: "https://images.unsplash.com/photo-1519225468063-3f837f996c34?q=80&w=2070&auto=format&fit=crop",
    },
    {
        id: "2",
        name: "Corporate Events",
        image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop",
    },
    {
        id: "3",
        name: "Family Parties",
        image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop",
    },
    {
        id: "4",
        name: "Birthday Bashes",
        image: "https://images.unsplash.com/photo-1530103862676-de3c9da59af7?q=80&w=2069&auto=format&fit=crop",
    },
];

const CarouselItem = ({ item, index, scrollX }: { item: any, index: number, scrollX: SharedValue<number> }) => {
    const rStyle = useAnimatedStyle(() => {
        const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
        ];

        const scale = interpolate(
            scrollX.value,
            inputRange,
            [0.9, 1, 0.9],
            Extrapolation.CLAMP
        );

        const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.6, 1, 0.6],
            Extrapolation.CLAMP
        );

        return {
            transform: [{ scale }],
            opacity,
        };
    });

    return (
        <View style={styles.cardContainer}>
            <Animated.View style={[styles.card, rStyle]}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={styles.overlay}>
                    <Text style={styles.name}>{item.name}</Text>
                </View>
            </Animated.View>
        </View>
    );
};

export default function ServiceCarousel() {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);
    const [isMounted, setIsMounted] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const scrollX = useSharedValue(0);

    const updateIndex = (index: number) => {
        setActiveIndex(index);
    };

    const onScroll = useAnimatedScrollHandler((event) => {
        scrollX.value = event.contentOffset.x;
        const index = Math.round(event.contentOffset.x / width);
        runOnJS(updateIndex)(index);
    });

    // Set mounted flag after component is ready
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const interval = setInterval(() => {
            let nextIndex = activeIndex + 1;
            if (nextIndex >= DUMMY_DATA.length) {
                nextIndex = 0;
            }
            try {
                flatListRef.current?.scrollToIndex({
                    index: nextIndex,
                    animated: true,
                });
            } catch (error) {
                console.log("Scroll error:", error);
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [activeIndex, isMounted]);

    const getItemLayout = (data: any, index: number) => ({
        length: width,
        offset: width * index,
        index,
    });

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Featured Caterers</Text>
            <Animated.FlatList
                ref={flatListRef}
                data={DUMMY_DATA}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                getItemLayout={getItemLayout}
                renderItem={({ item, index }) => (
                    <CarouselItem item={item} index={index} scrollX={scrollX} />
                )}
            />
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.bookButton} onPress={() => router.push("/customer/select-event-type")}>
                    <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
    },
    header: {
        fontSize: 20,
        fontWeight: "bold",
        marginLeft: 20,
        marginBottom: 15,
        color: "#333",
    },
    cardContainer: {
        width: width,
        alignItems: "center",
        justifyContent: "center",
    },
    card: {
        width: width - 40,
        height: 200,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    image: {
        width: "100%",
        height: "100%",
    },
    overlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: 15,
    },
    name: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    bookButton: {
        backgroundColor: "#007AFF",
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 25,
        alignItems: "center",
        shadowColor: "#007AFF",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    bookButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    buttonContainer: {
        alignItems: "center",
        marginTop: 20,
        marginBottom: 10,
    },
});
