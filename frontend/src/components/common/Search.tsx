import { InputGroup, Input } from "@chakra-ui/react"
import { useNavigate, useLocation } from "@tanstack/react-router"
import React, { useEffect, useState } from "react"
import { FaSearch } from "react-icons/fa"

const Search = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const urlParams = new URLSearchParams(location.search)
  const initialQuery = urlParams.get('q') || ''

  const [search, setSearch] = useState(initialQuery)

  useEffect(() => {
    setSearch(initialQuery);
  }, [initialQuery])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = search.trim();
    if (trimmed.length === 0) return;

    navigate({ to: '/explore', search: { q: trimmed } });
  };

  return (
    <form onSubmit={onSubmit}>
      <InputGroup startElement={<FaSearch />}>
        <Input
          placeholder="Search..."
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>
    </form>
  )
}

export default Search