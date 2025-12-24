import React from 'react';
import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => {
    const { colors } = useTheme();
    return (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
            {children}
        </View>
    );
};

interface FeatureItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    text: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, text }) => {
    const { colors } = useTheme();
    return (
        <View style={styles.featureItem}>
            <Ionicons name={icon} size={20} color={colors.primary} style={styles.featureIcon} />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>{text}</Text>
        </View>
    );
};

interface ContactItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    onPress?: () => void;
}

const ContactItem: React.FC<ContactItemProps> = ({ icon, label, value, onPress }) => {
    const { colors } = useTheme();
    return (
        <TouchableOpacity
            style={styles.contactItem}
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.contactIconContainer, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name={icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>{label}</Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>{value}</Text>
            </View>
            {onPress && (
                <Ionicons name="chevron-forward" size={20} color={colors.iconInactive} />
            )}
        </TouchableOpacity>
    );
};

interface LinkItemProps {
    label: string;
    onPress: () => void;
}

const LinkItem: React.FC<LinkItemProps> = ({ label, onPress }) => {
    const { colors } = useTheme();
    return (
        <TouchableOpacity style={styles.linkItem} onPress={onPress} activeOpacity={0.7}>
            <Text style={[styles.linkText, { color: colors.text }]}>{label}</Text>
            <Ionicons name="open-outline" size={18} color={colors.icon} />
        </TouchableOpacity>
    );
};

export default function AboutScreen() {
    const { colors } = useTheme();

    const openLink = (url: string) => {
        Linking.canOpenURL(url).then((supported) => {
            if (supported) {
                Linking.openURL(url);
            } else {
                console.log("Don't know how to open URI: " + url);
            }
        });
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
                    <Ionicons name="restaurant" size={40} color="#fff" />
                </View>
                <Text style={[styles.appName, { color: colors.text }]}>CaterConnect</Text>
                <Text style={[styles.version, { color: colors.textSecondary }]}>Version 1.0.3</Text>
            </View>

            <Section title="App Overview">
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    CaterConnect is your one-stop solution for finding and booking the best catering services for your events. Whether it's a small gathering or a grand wedding, we connect you with top-rated caterers to make your event delicious and memorable.
                </Text>
            </Section>

            <Section title="Mission / Purpose">
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    Our mission is to simplify the catering booking process. We aim to bridge the gap between customers and caterers, providing a transparent, reliable, and hassle-free platform to discover, customize, and book culinary experiences.
                </Text>
            </Section>

            <Section title="Features">
                <FeatureItem icon="search-outline" text="Browse top-rated caterers near you" />
                <FeatureItem icon="options-outline" text="Customize menus to your taste" />
                <FeatureItem icon="calendar-outline" text="Easy booking and scheduling" />
                <FeatureItem icon="chatbubbles-outline" text="Direct communication with caterers" />
                <FeatureItem icon="star-outline" text="Verified reviews and ratings" />
            </Section>

            <Section title="Developer / Company">
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    Developed by <Text style={{ fontWeight: 'bold', color: colors.text }}>CaterConnect Inc.</Text>
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary, marginTop: 5 }]}>
                    We are a passionate team of foodies and tech enthusiasts dedicated to revolutionizing the catering industry.
                </Text>
            </Section>

            <Section title="Contact & Support">
                <ContactItem
                    icon="mail-outline"
                    label="Email"
                    value="support@caterconnect.com"
                    onPress={() => openLink('mailto:support@caterconnect.com')}
                />
                <ContactItem
                    icon="call-outline"
                    label="Phone"
                    value="+91 12345 67890"
                    onPress={() => openLink('tel:+911234567890')}
                />
                <ContactItem
                    icon="globe-outline"
                    label="Website"
                    value="www.caterconnect.com"
                    onPress={() => openLink('https://www.caterconnect.com')}
                />
            </Section>

            <Section title="Legal">
                <LinkItem
                    label="Privacy Policy"
                    onPress={() => openLink('https://www.caterconnect.com/privacy')}
                />
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <LinkItem
                    label="Terms & Conditions"
                    onPress={() => openLink('https://www.caterconnect.com/terms')}
                />
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <LinkItem
                    label="Licenses"
                    onPress={() => console.log('Show licenses')}
                />
            </Section>

            <View style={styles.footer}>
                <Text style={[styles.copyright, { color: colors.textSecondary }]}>
                    © 2024 CaterConnect Inc. All rights reserved.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    version: {
        fontSize: 16,
    },
    section: {
        marginHorizontal: 15,
        marginBottom: 15,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 15,
    },
    paragraph: {
        fontSize: 15,
        lineHeight: 22,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    featureIcon: {
        marginRight: 12,
        width: 24,
        textAlign: 'center',
    },
    featureText: {
        fontSize: 15,
        flex: 1,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    contactIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    contactInfo: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    contactValue: {
        fontSize: 15,
        fontWeight: '500',
    },
    linkItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    linkText: {
        fontSize: 16,
    },
    divider: {
        height: 1,
        width: '100%',
    },
    footer: {
        paddingVertical: 30,
        alignItems: 'center',
    },
    copyright: {
        fontSize: 12,
    },
});

