import type React from "react"
import Home from "../components/homepage/Index"
import type { MentorExplorePublic, MentorSessionPublic, MentorServicePublic } from "@/client"

interface HomePageProps {
  initialFeaturedData?: {
    mentors: MentorExplorePublic[];
    sessions: MentorSessionPublic[];
    services?: MentorServicePublic[];
  };
}


const HomePage: React.FC<HomePageProps> = ({ initialFeaturedData }) => {
  return (
    <Home initialFeaturedData={initialFeaturedData} />
  )
}

export default HomePage