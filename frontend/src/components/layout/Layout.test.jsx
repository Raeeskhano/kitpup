import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import Layout from './Layout';
import '@testing-library/jest-dom';

test('Layout renders Sidebar and MobileFooter with correct responsiveness classes', () => {
  const setCurrentPage = vi.fn();
  
  const { container } = render(
    <Layout currentPage="dashboard" setCurrentPage={setCurrentPage}>
      <div data-testid="page-content">Content</div>
    </Layout>
  );
  
  expect(screen.getByTestId('page-content')).toBeInTheDocument();
  
  // Sidebar should have "hidden md:flex" classes
  const sidebarNav = screen.getByText('Dashboard').closest('aside');
  expect(sidebarNav).toHaveClass('hidden');
  expect(sidebarNav).toHaveClass('md:flex');
  
  // Mobile footer should have "md:hidden" classes
  // The 'Home' link is in the mobile footer
  const mobileFooterNav = screen.getByText('Home').closest('div');
  expect(mobileFooterNav).toHaveClass('md:hidden');
});

test('Navigation clicks work in Sidebar', () => {
  const setCurrentPage = vi.fn();
  
  render(
    <Layout currentPage="dashboard" setCurrentPage={setCurrentPage}>
      <div>Content</div>
    </Layout>
  );
  
  const marketplaceBtn = screen.getByText('Marketplace').closest('button');
  fireEvent.click(marketplaceBtn);
  
  expect(setCurrentPage).toHaveBeenCalledWith('marketplace');
});

test('Navigation clicks work in MobileFooter', () => {
  const setCurrentPage = vi.fn();
  
  render(
    <Layout currentPage="dashboard" setCurrentPage={setCurrentPage}>
      <div>Content</div>
    </Layout>
  );
  
  const shopBtn = screen.getByText('Shop').closest('button');
  fireEvent.click(shopBtn);
  
  expect(setCurrentPage).toHaveBeenCalledWith('marketplace');
});
