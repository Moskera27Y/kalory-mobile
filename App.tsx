// App.tsx - Kalory Premium v2.0
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Home: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// ==================== SPLASH SCREEN ====================
function SplashScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useSharedValue(0.3);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scaleAnim.value = withSpring(1, { damping: 10, stiffness: 100 });
    rotation.value = withTiming(360, {
      duration: 4000,
      easing: Easing.linear,
    });

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      navigation.replace('Onboarding');
    }, 3000);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleAnim.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: fadeAnim,
  }));

  return (
    <LinearGradient colors={['#E8F5E9', '#FFFFFF']} style={styles.container}>
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <Image
          source={require('./assets/logo.jpg')}
          style={styles.logoP}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
        Kalory
      </Animated.Text>
      <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>
        Health & Fitness Premium
      </Animated.Text>
      <Animated.Text style={[styles.message, { opacity: fadeAnim }]}>
        Transforma tu salud, una decisión a la vez
      </Animated.Text>
    </LinearGradient>
  );
}

// ==================== ONBOARDING ====================
function OnboardingScreen({ navigation }: any) {
  const [step, setStep] = React.useState(0);
  const [value, setValue] = React.useState('');
  const progressWidth = useRef(new Animated.Value(0)).current;

  const questions = [
    {
      id: 'name',
      label: '¿Cuál es tu nombre?',
      placeholder: 'Ingresa tu nombre',
      type: 'text',
    },
    {
      id: 'age',
      label: '¿Cuántos años tienes?',
      placeholder: 'Edad en años',
      type: 'number',
    },
    {
      id: 'weight',
      label: '¿Cuál es tu peso actual?',
      placeholder: 'Peso en kg',
      type: 'number',
    },
    {
      id: 'height',
      label: '¿Cuál es tu altura?',
      placeholder: 'Altura en cm',
      type: 'number',
    },
    {
      id: 'gender',
      label: '¿Tu género?',
      options: ['👨 Masculino', '👩 Femenino', '🏳️ Otro'],
      type: 'options',
    },
    {
      id: 'goal',
      label: '¿Cuál es tu meta?',
      options: ['🏃 Perder peso', '💪 Ganar músculo', '🏃‍♂️ Resistencia', '⚖️ Mantener peso'],
      type: 'options',
    },
  ];

  const currentQ = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  useEffect(() => {
    Animated.timing(progressWidth, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const handleNext = () => {
    if (!value.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (step < questions.length - 1) {
      setStep(step + 1);
      setValue('');
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      navigation.replace('Home');
    }
  };

  const handleBack = () => {
    Haptics.selectionAsync();
    if (step > 0) setStep(step - 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        <Animated.View
          style={[styles.progressBar, { width: `${progress}%` }]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.question}>{currentQ.label}</Text>

        {currentQ.type === 'options' ? (
          <View style={styles.optionsContainer}>
            {currentQ.options?.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.optionBtn,
                  value === opt && styles.optionSelected,
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setValue(opt);
                }}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder={currentQ.placeholder}
              value={value}
              onChangeText={setValue}
              placeholderTextColor="#A0AEC0"
              keyboardType={
                currentQ.type === 'number' ? 'numeric' : 'default'
              }
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.navButtons}>
        {step > 0 && (
          <TouchableOpacity onPress={handleBack}>
            <Text style={styles.backText}>Atrás</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.nextBtn,
            !value.trim() && styles.nextBtnDisabled,
          ]}
          onPress={handleNext}
          disabled={!value.trim()}
        >
          <Text style={styles.nextText}>
            {step === questions.length - 1
              ? 'Crear Plan'
              : 'Siguiente'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ==================== HOME SCREEN ====================
function HomeScreen({ navigation }: any) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const metrics = {
    kcal: 420,
    goal: 2150,
    water: 6,
    waterGoal: 8,
    weight: 72,
    target: 68,
  };

  return (
    <LinearGradient
      colors={['#F0FDE8', '#FFFFFF']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Animated.Text style={[styles.emoji, { transform: [{ scale: pulse }] }]}>
            🔥
          </Animated.Text>
          <Text style={styles.greeting}>¡Hola, Crispín!</Text>
          <Text style={styles.date}>Domingo, 21 de septiembre</Text>
        </View>

        <LinearGradient
          colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.4)']}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>Calorías de hoy</Text>
          <View style={styles.kcalRow}>
            <View>
              <Text style={styles.kcalVal}>{metrics.kcal}</Text>
              <Text style={styles.kcalLabel}>Quemadas</Text>
            </View>
            <View>
              <Text style={styles.kcalVal}>{metrics.goal}</Text>
              <Text style={styles.kcalLabel}>Objetivo</Text>
            </View>
          </View>
        </LinearGradient>

        <LinearGradient
          colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.4)']}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>Agua</Text>
          <Text style={styles.waterText}>
            {metrics.water}/{metrics.waterGoal} vasos
          </Text>
          <View style={styles.waterDrops}>
            {[...Array(metrics.waterGoal)].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.drop,
                  i < metrics.water && styles.dropFilled,
                ]}
              />
            ))}
          </View>
        </LinearGradient>

        <View style={styles.navGrid}>
          {[
            { icon: '📷', label: 'Escanear comida' },
            { icon: '🌙', label: 'Sueño' },
            { icon: '💪', label: 'Entrenamientos' },
            { icon: '👤', label: 'Perfil' },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.navItem}
              onPress={() =>
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              }
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text style={styles.navLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: ({ current, layouts }) => ({
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          }),
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logoP: { width: 120, height: 120, borderRadius: 30 },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2D3748',
    textAlign: 'center',
  },
  tagline: { fontSize: 16, color: '#A0AEC0', marginTop: 8, textAlign: 'center' },
  message: {
    fontSize: 18,
    color: '#4A5568',
    textAlign: 'center',
    marginTop: 30,
    paddingHorizontal: 30,
  },
  progressContainer: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, marginVertical: 20, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#66BB6A', borderRadius: 4 },
  question: { fontSize: 24, fontWeight: '600', color: '#2D3748', textAlign: 'center', marginBottom: 40 },
  inputWrapper: { marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 16,
    padding: 16,
    fontSize: 18,
    color: '#2D3748',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  optionsContainer: { gap: 12 },
  optionBtn: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: { backgroundColor: '#E8F5E9', borderColor: '#66BB6A' },
  optionText: { fontSize: 16, color: '#2D3748' },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  backText: { fontSize: 16, color: '#718096' },
  nextBtn: {
    backgroundColor: '#66BB6A',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  nextBtnDisabled: { backgroundColor: '#CBD5E0' },
  nextText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  emoji: { fontSize: 28, marginRight: 10 },
  greeting: { fontSize: 24, fontWeight: '700', color: '#2D3748' },
  date: { fontSize: 14, color: '#718096', position: 'absolute', top: 0, right: 0 },
  card: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#4A5568', marginBottom: 16 },
  kcalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  kcalVal: { fontSize: 28, fontWeight: 'bold', color: '#2D3748' },
  kcalLabel: { fontSize: 14, color: '#718096', marginTop: 4 },
  waterText: { fontSize: 18, fontWeight: '600', color: '#2D3748', marginBottom: 12 },
  waterDrops: { flexDirection: 'row', gap: 8 },
  drop: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#E2E8F0', flex: 1 },
  dropFilled: { backgroundColor: '#4FC3F7' },
  navGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  navItem: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  navIcon: { fontSize: 32, marginBottom: 8 },
  navLabel: { fontSize: 14, color: '#4A5568' },
});
