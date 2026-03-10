import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import Dashboard from '../screens/Dashboard';

import AddMovement from '../screens/AddMovement';
import MovementList from '../screens/MovementList';

import RegisterCivilian from '../screens/register/RegisterCivilian';
import CivilianList from '../screens/register/CivilianList';
import BiometricVerify from '../screens/biometric/BiometricVerify';
import OfflineMap from '../screens/map/OfflineMap';
import LandmarkDetail from '../screens/map/LandmarkDetail';
import CensusMode from '../screens/census/CensusMode';
import AddCensusData from '../screens/census/AddCensusData';
import DailySummary from '../screens/logs/DailySummary';
import ReportAlert from '../screens/logs/ReportAlert';
import EntryLog from '../screens/logs/EntryLog';

const Stack = createStackNavigator();

export default function AppNavigator({ isAuthenticated, setIsAuthenticated }) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
                <Stack.Screen name="Login">
                    {(props) => <LoginScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
                </Stack.Screen>
            ) : (
                <>
                    <Stack.Screen name="Dashboard">
                        {(props) => <Dashboard {...props} setIsAuthenticated={setIsAuthenticated} />}
                    </Stack.Screen>
                    <Stack.Screen name="AddMovement" component={AddMovement} />
                    <Stack.Screen name="MovementList" component={MovementList} />
                    <Stack.Screen name="RegisterCivilian" component={RegisterCivilian} />
                    <Stack.Screen name="CivilianList" component={CivilianList} />
                    <Stack.Screen name="BiometricVerify" component={BiometricVerify} />
                    <Stack.Screen name="OfflineMap" component={OfflineMap} />
                    <Stack.Screen name="LandmarkDetail" component={LandmarkDetail} />
                    <Stack.Screen name="CensusMode" component={CensusMode} />
                    <Stack.Screen name="AddCensusData" component={AddCensusData} />
                    <Stack.Screen name="DailySummary" component={DailySummary} />
                    <Stack.Screen name="ReportAlert" component={ReportAlert} />
                    <Stack.Screen name="EntryLog" component={EntryLog} />
                </>
            )}
        </Stack.Navigator>
    );
}
