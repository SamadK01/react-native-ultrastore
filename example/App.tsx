/**
 * UltraStore Example App
 * Demonstrates all features of react-native-ultrastore
 */

import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import {
  useUltraStore,
  useUltraStoreSelector,
  clearAll,
  getAllKeys,
  createNamespace,
  defaultStorage,
  createLoggerMiddleware,
} from 'react-native-ultrastore';

// Enable logging in development
if (__DEV__) {
  defaultStorage.use(createLoggerMiddleware({ collapsed: false }));
}

// Create namespaces
const userStorage = createNamespace('user');
const cartStorage = createNamespace('cart');

interface User {
  name: string;
  email: string;
  token: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>🚀 UltraStore Demo</Text>
        
        <UserSection />
        <Divider />
        
        <CartSection />
        <Divider />
        
        <CounterSection />
        <Divider />
        
        <ThemeSection />
        <Divider />
        
        <UtilitySection />
      </ScrollView>
    </SafeAreaView>
  );
}

// User Management Section
function UserSection() {
  const [user, setUser] = useUltraStore<User>('user', {
    name: '',
    email: '',
    token: '',
  }, userStorage);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleLogin = () => {
    setUser({
      name,
      email,
      token: `token_${Date.now()}`,
    });
    setName('');
    setEmail('');
  };

  const handleLogout = () => {
    setUser({ name: '', email: '', token: '' });
  };

  return (
    <Section title="👤 User Management (Namespace)">
      {user.token ? (
        <View>
          <InfoText>Name: {user.name}</InfoText>
          <InfoText>Email: {user.email}</InfoText>
          <InfoText>Token: {user.token.substring(0, 20)}...</InfoText>
          <Button title="Logout" onPress={handleLogout} color="#f44336" />
        </View>
      ) : (
        <View>
          <Input
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <Button title="Login" onPress={handleLogin} />
        </View>
      )}
    </Section>
  );
}

// Shopping Cart Section
function CartSection() {
  const [cart, setCart] = useUltraStore<CartItem[]>('cart', [], cartStorage);

  const addItem = () => {
    const newItem: CartItem = {
      id: `item_${Date.now()}`,
      name: `Product ${cart.length + 1}`,
      price: Math.floor(Math.random() * 100) + 10,
      quantity: 1,
    };
    setCart([...cart, newItem]);
  };

  const removeItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Section title="🛒 Shopping Cart (Namespace)">
      <InfoText>Items: {cart.length}</InfoText>
      <InfoText>Total: ${total.toFixed(2)}</InfoText>
      
      {cart.map(item => (
        <View key={item.id} style={styles.cartItem}>
          <Text style={styles.cartItemText}>
            {item.name} - ${item.price} x {item.quantity}
          </Text>
          <TouchableOpacity onPress={() => removeItem(item.id)}>
            <Text style={styles.removeButton}>❌</Text>
          </TouchableOpacity>
        </View>
      ))}
      
      <Button title="Add Item" onPress={addItem} />
      {cart.length > 0 && (
        <Button 
          title="Clear Cart" 
          onPress={() => setCart([])} 
          color="#f44336" 
        />
      )}
    </Section>
  );
}

// Counter Section (with Selector)
function CounterSection() {
  const [counter, setCounter] = useUltraStore('counter', 0);

  // Selector example - only re-renders when isEven changes
  const isEven = useUltraStoreSelector(
    'counter',
    (count: number) => count % 2 === 0,
    0
  );

  return (
    <Section title="🔢 Counter (with Selector)">
      <InfoText>Count: {counter}</InfoText>
      <InfoText>Is Even: {isEven ? 'Yes ✅' : 'No ❌'}</InfoText>
      
      <View style={styles.buttonRow}>
        <Button title="-" onPress={() => setCounter(c => c - 1)} />
        <Button title="Reset" onPress={() => setCounter(0)} color="#ff9800" />
        <Button title="+" onPress={() => setCounter(c => c + 1)} />
      </View>
    </Section>
  );
}

// Theme Section
function ThemeSection() {
  const [theme, setTheme] = useUltraStore<'light' | 'dark' | 'auto'>('theme', 'light');

  return (
    <Section title="🎨 Theme Preference">
      <InfoText>Current: {theme}</InfoText>
      
      <View style={styles.buttonRow}>
        <Button 
          title="Light" 
          onPress={() => setTheme('light')}
          color={theme === 'light' ? '#4CAF50' : '#757575'}
        />
        <Button 
          title="Dark" 
          onPress={() => setTheme('dark')}
          color={theme === 'dark' ? '#4CAF50' : '#757575'}
        />
        <Button 
          title="Auto" 
          onPress={() => setTheme('auto')}
          color={theme === 'auto' ? '#4CAF50' : '#757575'}
        />
      </View>
    </Section>
  );
}

// Utility Section
function UtilitySection() {
  const showKeys = () => {
    const keys = getAllKeys();
    Alert.alert('All Keys', keys.join('\n') || 'No keys found');
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure? This will delete everything.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            clearAll();
            Alert.alert('Success', 'All data cleared!');
          }
        },
      ]
    );
  };

  return (
    <Section title="🛠️ Utilities">
      <Button title="Show All Keys" onPress={showKeys} color="#2196F3" />
      <Button title="Clear All Data" onPress={clearAllData} color="#f44336" />
    </Section>
  );
}

// Helper Components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoText({ children }: { children: React.ReactNode }) {
  return <Text style={styles.infoText}>{children}</Text>;
}

function Input({ placeholder, value, onChangeText }: any) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor="#999"
    />
  );
}

function Button({ title, onPress, color = '#4CAF50' }: any) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 14,
    color: '#333',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    marginBottom: 6,
  },
  cartItemText: {
    fontSize: 14,
    color: '#333',
  },
  removeButton: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
});

export default App;
