import { test, expect } from '@playwright/test';

test.describe('Bond Quotation Chat Flow', () => {
  test('should complete full quotation workflow', async ({ page }) => {
    // Navigate to the chat page
    await page.goto('/chat');
    
    // Wait for the chat interface to load
    await expect(page.locator('.chat-header')).toBeVisible();
    await expect(page.locator('text=Quote Specialist Agent')).toBeVisible();
    
    // Check initial welcome message
    await expect(page.locator('text=Hello! I\'m your Quote Specialist Agent')).toBeVisible();
    
    // Type first message requesting a bond
    await page.fill('.chat-input input', 'I need a performance bond for $2.5M');
    await page.click('button:has-text("Send")');
    
    // Wait for agent response about needing company grade
    await expect(page.locator('text=I need to fetch your company\'s grade from IRP first')).toBeVisible();
    
    // Provide company ID
    await page.fill('.chat-input input', 'Company ID C-001');
    await page.click('button:has-text("Send")');
    
    // Wait for grade confirmation
    await expect(page.locator('text=Great! I\'ve fetched your company\'s grade from IRP: A')).toBeVisible();
    
    // Check that grade chip appears
    await expect(page.locator('mat-chip:has-text("Grade: A")')).toBeVisible();
    
    // Provide bond details
    await page.fill('.chat-input input', 'Performance bond, $2.5M, 180 days, US');
    await page.click('button:has-text("Send")');
    
    // Wait for pricing information
    await expect(page.locator('text=Perfect! I\'ve found pricing information')).toBeVisible();
    
    // Check that RAG chip appears
    await expect(page.locator('mat-chip:has-text("RAG:")')).toBeVisible();
    
    // Verify quote panel is populated
    await expect(page.locator('text=Company C-001')).toBeVisible();
    await expect(page.locator('text=Performance')).toBeVisible();
    await expect(page.locator('text=2,500,000')).toBeVisible();
    
    // Check that finalize button is enabled
    const finalizeButton = page.locator('button:has-text("Finalize & Save")');
    await expect(finalizeButton).toBeEnabled();
    
    // Click finalize and save
    await finalizeButton.click();
    
    // Wait for bond request dialog
    await expect(page.locator('text=Bond Request Payload')).toBeVisible();
    
    // Verify JSON payload is displayed
    await expect(page.locator('pre.json-payload')).toBeVisible();
    
    // Check that the payload contains expected data
    const payloadText = await page.locator('pre.json-payload').textContent();
    expect(payloadText).toContain('"quotationId"');
    expect(payloadText).toContain('"companyId": "C-001"');
    expect(payloadText).toContain('"bondType": "Performance"');
    expect(payloadText).toContain('"amount": 2500000');
    
    // Close dialog
    await page.click('button:has-text("Close")');
    
    // Verify final agent message appears
    await expect(page.locator('text=Perfect! Your quotation has been saved')).toBeVisible();
    await expect(page.locator('text=POST /bondRequests')).toBeVisible();
  });
  
  test('should block RAG access for grade D companies', async ({ page }) => {
    await page.goto('/chat');
    
    // Provide company ID for grade D company
    await page.fill('.chat-input input', 'Company ID C-004');
    await page.click('button:has-text("Send")');
    
    // Wait for grade confirmation
    await expect(page.locator('text=Grade D')).toBeVisible();
    
    // Try to get pricing information
    await page.fill('.chat-input input', 'I need pricing for a performance bond');
    await page.click('button:has-text("Send")');
    
    // Should be blocked from RAG access
    await expect(page.locator('text=cannot provide pricing information for companies with grade D')).toBeVisible();
    
    // Check error chip
    await expect(page.locator('mat-chip:has-text("Grade: D")')).toBeVisible();
    
    // Finalize button should be disabled
    await expect(page.locator('button:has-text("Finalize & Save")')).toBeDisabled();
  });
  
  test('should handle theme toggle', async ({ page }) => {
    await page.goto('/chat');
    
    // Check initial light theme
    await expect(page.locator('body')).not.toHaveClass('dark-theme');
    
    // Toggle to dark theme
    await page.click('mat-slide-toggle');
    
    // Check dark theme is applied
    await expect(page.locator('body')).toHaveClass('dark-theme');
    
    // Toggle back to light theme
    await page.click('mat-slide-toggle');
    
    // Check light theme is restored
    await expect(page.locator('body')).not.toHaveClass('dark-theme');
  });
}); 