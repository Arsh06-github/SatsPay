# Design Document

## Overview

This design addresses two main UI issues in the SatsPay wallet connection interface:
1. Inconsistent button state management when wallet extensions are installed/connected
2. A debugging panel that appears as a popup window in the top-right corner of the screen

The solution involves enhancing the existing `WalletConnectionManager` to properly manage button states and modifying the `WalletDebug` module to hide the debug panel from users while preserving console logging functionality.

## Architecture

The fix will modify two existing components:

### WalletConnectionManager Enhancement
- Improve the `updateWalletList()` method to handle button text transitions more accurately
- Add proper state management for the connect/disconnect button text
- Ensure button styling reflects the actual connection state

### WalletDebug Module Modification  
- Hide the visual debug panel from the user interface
- Preserve console logging functionality for developers
- Maintain debugging capabilities without visual interference

## Components and Interfaces

### 1. Enhanced Button State Management

**Component:** `WalletConnectionManager.updateWalletList()`

**Current Behavior:**
- Button shows "Install Extension" when extension not detected
- Button text doesn't properly update to "Connected" after successful connection
- Button styling may not reflect actual connection state

**Enhanced Behavior:**
```javascript
// Button state logic
if (wallet.isExtension && !wallet.installed) {
  // Extension not installed
  buttonText = "Install Extension"
  buttonStyle = "warning"
} else if (this.connectedWallet && this.connectedWallet.id === walletType) {
  // Wallet is connected
  buttonText = "Connected" 
  buttonStyle = "success"
} else {
  // Wallet available but not connected
  buttonText = "Connect"
  buttonStyle = "primary"
}
```

### 2. Debug Panel Visibility Control

**Component:** `WalletDebug.createDebugPanel()`

**Current Behavior:**
- Creates a visible debug panel in the top-right corner
- Shows real-time wallet detection information
- Appears as a "popup window" to users

**Enhanced Behavior:**
- Debug panel will be hidden by default (`display: none`)
- Console logging will remain active for developers
- Debug panel can be shown via browser console command for development

## Data Models

### Button State Model
```javascript
{
  walletType: string,           // 'blue', 'leather', 'xverse'
  isInstalled: boolean,         // Extension installation status
  isConnected: boolean,         // Current connection status
  buttonText: string,           // Display text for button
  buttonStyle: string,          // CSS class for styling
  isClickable: boolean          // Whether button should be interactive
}
```

### Debug Panel State Model
```javascript
{
  isVisible: boolean,           // Panel visibility (default: false)
  updateInterval: number,       // Update frequency in ms
  logToConsole: boolean,        // Whether to log debug info
  panelElement: HTMLElement     // Reference to debug panel DOM element
}
```

## Error Handling

### Button State Errors
- **Invalid wallet type:** Log error to console, default to "Connect" text
- **Connection state mismatch:** Refresh wallet display and re-evaluate state
- **Missing DOM elements:** Gracefully handle missing button elements

### Debug Panel Errors
- **Panel creation failure:** Fall back to console-only logging
- **Update interval errors:** Clear interval and restart with default timing
- **DOM manipulation errors:** Log to console without breaking functionality

## Testing Strategy

### Unit Tests (Optional)
- Test button state transitions for all wallet types
- Test debug panel visibility controls
- Test error handling scenarios

### Integration Tests
- Verify button text updates correctly after wallet connection
- Confirm debug panel is hidden from user view
- Test wallet connection flow with proper UI feedback

### Manual Testing Scenarios
1. **Extension Not Installed:**
   - Button should show "Install Extension"
   - Clicking should show installation instructions
   
2. **Extension Installed, Not Connected:**
   - Button should show "Connect"
   - Button should have primary styling
   
3. **Wallet Connected:**
   - Button should show "Connected" 
   - Button should have success styling
   - Status indicator should show connected state
   
4. **Debug Panel Hidden:**
   - No debug panel should be visible on page load
   - Console should still receive debug information
   - Debug panel should be accessible via console command

### Browser Compatibility Testing
- Test button state management across different browsers
- Verify debug panel hiding works consistently
- Ensure wallet extension detection remains functional

## Implementation Notes

### CSS Classes for Button States
```css
.wallet-connect-btn.warning {
  background: #f97316; /* Orange for "Install Extension" */
}

.wallet-connect-btn.success {
  background: #10b981; /* Green for "Connected" */
}

.wallet-connect-btn.primary {
  background: #1e3a8a; /* Blue for "Connect" */
}
```

### Debug Panel Control
```javascript
// Hide debug panel by default
debugPanel.style.display = 'none';

// Provide console access for developers
window.showWalletDebug = () => {
  document.getElementById('wallet-debug-panel').style.display = 'block';
};

window.hideWalletDebug = () => {
  document.getElementById('wallet-debug-panel').style.display = 'none';
};
```

### State Synchronization
- Ensure all wallet-related UI elements update consistently
- Maintain state persistence across page refreshes
- Handle race conditions between wallet detection and UI updates

## Performance Considerations

- Debug panel updates will continue running but won't cause visual reflows
- Button state updates should be debounced to prevent excessive DOM manipulation
- Wallet detection polling should remain efficient

## Security Considerations

- Debug information should not expose sensitive wallet data
- Button state changes should not bypass wallet security checks
- Hidden debug panel should not create security vulnerabilities