import MeScreen from "./screens/MeScreen";
const fs = require('fs');
const targetFile = fs.existsSync('src/navigation/TabNavigator.js') 
  ? 'src/navigation/TabNavigator.js' 
  : 'src/navigation/AppNavigator.js';

let code = fs.readFileSync(targetFile, 'utf8');

// 1. Import DownloadsScreen
if (!code.includes('DownloadsScreen')) {
  code = `import DownloadsScreen from '../screens/DownloadsScreen';\n` + code;
}

// 2. Add Tab.Screen entry if Tab Navigator exists
if (code.includes('<Tab.Navigator') && !code.includes('name="Downloads"')) {
  const tabScreenEntry = `  <Tab.Screen 
        name="Downloads" 
        component={DownloadsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="download-outline" size={size} color={color} />
          ),
        }} 
      />\n    </Tab.Navigator>`;

  code = code.replace('</Tab.Navigator>', tabScreenEntry);
} else if (code.includes('<Stack.Navigator') && !code.includes('name="Downloads"')) {
  const stackScreenEntry = `  <Stack.Screen name="Downloads" component={DownloadsScreen} />
        <Stack.Screen name="Me" component={MeScreen} />\n    </Stack.Navigator>`;
  code = code.replace('</Stack.Navigator>', stackScreenEntry);
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log('DOWNLOADS_NAVIGATION_REGISTERED in ' + targetFile);
