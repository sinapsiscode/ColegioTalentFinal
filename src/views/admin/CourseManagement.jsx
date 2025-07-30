import React from 'react'
import Header from '../../components/common/Header'
import CourseAssignmentManager from '../../components/admin/CourseAssignmentManager'

const CourseManagement = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16">
        <CourseAssignmentManager />
      </main>
    </div>
  )
}

export default CourseManagement