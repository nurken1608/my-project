import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { categoriesData } from '../data/mockData'

const Header = () => {
  const [hoveredCategory, setHoveredCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [cartCount, setCartCount] = useState(0)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const navigate = useNavigate()
  const searchRef = useRef(null)
  const dropdownTimeoutRef = useRef(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    // Update favorites and cart counts from localStorage
    const updateCounts = () => {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setFavoritesCount(favorites.length)
      setCartCount(cart.length)
    }
    
    updateCounts()
    // Listen for storage changes
    window.addEventListener('storage', updateCounts)
    // Custom event for same-tab updates
    window.addEventListener('favoritesUpdated', updateCounts)
    window.addEventListener('cartUpdated', updateCounts)
    
    // Close search suggestions when clicking outside
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchSuggestions(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    
    return () => {
      window.removeEventListener('storage', updateCounts)
      window.removeEventListener('favoritesUpdated', updateCounts)
      window.removeEventListener('cartUpdated', updateCounts)
      document.removeEventListener('mousedown', handleClickOutside)
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // Handle scroll to show/hide header
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Show header at top of page
      if (currentScrollY < 10) {
        setIsHeaderVisible(true)
        lastScrollY.current = currentScrollY
        return
      }

      // Determine scroll direction
      if (currentScrollY > lastScrollY.current) {
        // Scrolling down - hide header
        setIsHeaderVisible(false)
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up - show header
        setIsHeaderVisible(true)
      }
      
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/plp?search=${encodeURIComponent(searchQuery)}`)
      setShowSearchSuggestions(false)
      setSearchQuery('')
    }
  }

  const handleCategoryClick = (category, subcategory) => {
    navigate(`/plp?category=${category}&subcategory=${subcategory}`)
    setHoveredCategory(null)
  }

  const handleCategoryMouseEnter = (categoryKey) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
    }
    setHoveredCategory(categoryKey)
  }

  const handleCategoryMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null)
    }, 200) // Small delay to allow moving to dropdown
  }

  const handleDropdownMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
    }
  }

  const handleDropdownMouseLeave = () => {
    setHoveredCategory(null)
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-md transition-transform duration-300 ease-in-out ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Top Row - Secondary Navigation */}
      <div className="bg-gray-100 py-2">
        <div className="container mx-auto px-4 flex justify-end">
          <nav className="flex gap-6 text-sm">
            <Link to="/help" className="hover:text-gray-600">Help</Link>
            <Link to="/join" className="hover:text-gray-600">Join Us</Link>
            <Link to="/auth" className="hover:text-gray-600">Sign In</Link>
          </nav>
        </div>
      </div>

      {/* Primary Row */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-black">
            TANDA SHOES
          </Link>

          {/* Categories */}
          <nav className="flex gap-8">
            {['Men', 'Women', 'Kids', 'Sale'].map((cat) => {
              const categoryKey = cat.toLowerCase()
              return (
                <div
                  key={cat}
                  className="relative"
                  onMouseEnter={() => cat !== 'Sale' && handleCategoryMouseEnter(categoryKey)}
                  onMouseLeave={handleCategoryMouseLeave}
                >
                  <Link
                    to={`/plp?category=${categoryKey}`}
                    className="text-gray-700 hover:text-black font-medium"
                  >
                    {cat}
                  </Link>
                </div>
              )
            })}
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSearchSuggestions(e.target.value.length > 0)
                  }}
                  onFocus={() => setShowSearchSuggestions(searchQuery.length > 0)}
                  placeholder="Search"
                  className="border border-gray-300 rounded px-3 py-1 text-sm w-40"
                />
                <button type="submit" className="ml-2 text-gray-600 hover:text-black">
                  <i className="fas fa-search"></i>
                </button>
              </form>
              
              {/* Search Suggestions */}
              {showSearchSuggestions && searchQuery && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {/* BACKEND: Search suggestions. Expected endpoint: /api/search/suggestions?q=... */}
                  <div className="p-2 text-sm text-gray-500">
                    Type and press Enter to search for "{searchQuery}"
                  </div>
                </div>
              )}
            </div>

            {/* Favorites */}
            <Link to="/favorites" className="relative text-gray-600 hover:text-black">
              <i className="fas fa-heart text-xl"></i>
              {favoritesCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative text-gray-600 hover:text-black">
              <i className="fas fa-shopping-cart text-xl"></i>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Full-Screen Dropdown Menu */}
      {hoveredCategory && categoriesData[hoveredCategory] && (
        <div
          className="fixed left-0 right-0 bg-white shadow-lg border-t z-40"
          style={{
            top: '100px', // Header height (top row ~36px + primary row ~64px)
            animation: 'slideDown 0.3s ease-out'
          }}
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
        >
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-2 gap-8">
              {Object.entries(categoriesData[hoveredCategory]).map(([section, items]) => (
                <div key={section}>
                  <h3 className="font-bold text-lg mb-4">{section}</h3>
                  <ul className="space-y-2">
                    {items.map((item) => {
                      const subcategory = item.toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, '')
                      return (
                        <li key={item}>
                          <button
                            onClick={() => handleCategoryClick(hoveredCategory, subcategory)}
                            className="text-gray-600 hover:text-black text-left transition-colors"
                          >
                            {item}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header

