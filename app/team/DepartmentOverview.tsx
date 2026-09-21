'use client';

export default function DepartmentOverview() {
  const departments = [
    {
      name: 'Admissions Team',
      icon: 'ri-customer-service-2-line',
      description: 'Guides families through the enrollment journey with care, clarity, and a welcoming spirit.',
      responsibilities: ['Family support', 'Enrollment guidance', 'School tours', 'Student onboarding']
    },
    {
      name: 'Academic Team',
      icon: 'ri-compass-3-line',
      description: 'Creates engaging, age-appropriate learning experiences that inspire curiosity and excellence.',
      responsibilities: ['Lesson planning', 'Student progress support', 'Curriculum delivery', 'Classroom guidance']
    },
    {
      name: 'Spiritual Life Team',
      icon: 'ri-scales-line',
      description: 'Fosters a Christ-centered culture rooted in faith, worship, character, and service.',
      responsibilities: ['Devotionals', 'Discipleship', 'Character formation', 'Community care']
    },
    {
      name: 'Arts & Sports Team',
      icon: 'ri-building-2-line',
      description: 'Nurtures creativity, confidence, and healthy lifestyles through music, sports, and extracurricular activities.',
      responsibilities: ['Music development', 'Sports training', 'Talent discovery', 'Creative expression']
    },
    {
      name: 'Operations Team',
      icon: 'ri-money-dollar-circle-line',
      description: 'Ensures a structured, safe, and smoothly run school experience for students and families.',
      responsibilities: ['School operations', 'Student care', 'Parent communication', 'Daily coordination']
    }
  ];

  return (
    <section className="py-20 bg-[#F3F5F8]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#063B82] mb-6">Our Support Teams</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every team works together to create a nurturing, faith-led school environment where children can flourish.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((dept, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-[#FFD400] rounded-full flex items-center justify-center mb-6">
                <i className={`${dept.icon} text-2xl text-white`}></i>
              </div>
              <h3 className="text-xl font-bold text-[#063B82] mb-4">{dept.name}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{dept.description}</p>
              <div>
                <h4 className="font-semibold text-[#063B82] mb-3">Key Responsibilities:</h4>
                <ul className="space-y-2">
                  {dept.responsibilities.map((responsibility, respIndex) => (
                    <li key={respIndex} className="flex items-center text-gray-700">
                      <i className="ri-check-line text-[#FFD400] mr-2"></i>
                      {responsibility}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}