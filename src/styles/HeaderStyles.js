import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const HeaderWrapper = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 1000;
  transition: all 0.3s ease;
`;

export const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  max-width: 1200px;
  margin: 0 auto;
`;

export const Brand = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
  font-weight: bold;
  font-size: 1.2rem;
  gap: 8px;
  
  .brand-icon {
    font-size: 1.4rem;
    color: #007bff;
  }
  
  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

export const SearchContainer = styled.form`
  display: none;
  
  @media (min-width: 768px) {
    display: flex;
    flex: 1;
    max-width: 500px;
    margin: 0 20px;
  }
`;

export const SearchInput = styled.div`
  position: relative;
  width: 100%;
  
  input {
    width: 100%;
    padding: 8px 40px 8px 15px;
    border: 1px solid #ddd;
    border-radius: 20px;
    font-size: 0.9rem;
    
    &:focus {
      outline: none;
      border-color: #007bff;
    }
  }
  
  button {
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #666;
    padding: 5px 10px;
    cursor: pointer;
    
    &:hover {
      color: #007bff;
    }
  }
`;

export const NavActions = styled.nav`
  display: flex;
  align-items: center;
  gap: 15px;
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  position: relative;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  
  i {
    font-size: 1.2rem;
    margin-bottom: 2px;
  }
  
  .badge {
    position: absolute;
    top: 0;
    right: 0;
    background: #dc3545;
    color: white;
    font-size: 0.7rem;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 5px;
  }
  
  .icon-label {
    display: none;
    font-size: 0.75rem;
    
    @media (min-width: 768px) {
      display: block;
    }
  }
`;

export const MobileMenuButton = styled.button`
  display: block;
  background: none;
  border: none;
  padding: 8px;
  font-size: 1.2rem;
  color: #333;
  cursor: pointer;
  
  @media (min-width: 768px) {
    display: none;
  }
`;

export const MobileMenu = styled.div`
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  background: white;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
  
  @media (min-width: 768px) {
    display: none;
  }
`;

export const MobileSearch = styled.form`
  position: relative;
  margin-bottom: 10px;
  
  input {
    width: 100%;
    padding: 10px 40px 10px 15px;
    border: 1px solid #ddd;
    border-radius: 20px;
    font-size: 0.9rem;
  }
  
  button {
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #666;
    padding: 5px 10px;
  }
`;

export const MobileNavItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px 15px;
  text-decoration: none;
  color: #333;
  border-radius: 8px;
  background: #f8f9fa;
  
  i {
    margin-right: 10px;
  }
  
  &:hover {
    background: #e9ecef;
  }
`;

export const ProfileDropdown = styled.div`
  position: relative;
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-radius: 8px;
  min-width: 200px;
  margin-top: 10px;
  padding: 8px 0;
  
  .dropdown-header {
    padding: 8px 15px;
    border-bottom: 1px solid #ddd;
    
    .user-name {
      display: block;
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .user-email {
      display: block;
      font-size: 0.8rem;
      color: #666;
    }
  }
`;

export const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 8px 15px;
  text-decoration: none;
  color: #333;
  
  i {
    margin-right: 10px;
    width: 20px;
  }
  
  &:hover {
    background: #f8f9fa;
  }
  
  &.text-danger {
    color: #dc3545;
  }
`;