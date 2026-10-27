// This is the resources page. Users can view different links and resources available
//  to them. Currently it is read-only and the users cannot add their own resources. 

// external imports
import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Importing MaterialCommunityIcons icon library

// internal imports
import ResourceLink from '@/components/ResourceLink';
import { COLORS } from '@/constants/Colors';


const Resources = ({ navigation }) => {
  
  // Variables to track and set states of various things such as element visibility or an array of items
  const [expandedSections, setExpandedSections] = useState({});

  // Function to toggle the expansion state of a section
  const toggleSection = (sectionTitle) => {
    setExpandedSections(prevState => ({
      ...prevState,
      [sectionTitle]: !prevState[sectionTitle]
    }));
  };

  // Function to render expand/collapse icon based on section's expansion state
  const renderExpandIcon = (sectionTitle) => (
    <MaterialCommunityIcons name={expandedSections[sectionTitle] ? 'chevron-up' : 'chevron-down'} size={25} color="black" />
  );

  return (
    <ScrollView style={styles.bodyContainer}>
      <View style={styles.mainContentContainer}>
        <View style={styles.category}>
          <TouchableOpacity onPress={() => toggleSection('Early Intervention Services/Parent Education')}>
            <View style={styles.titleContainer}>
              <Text style={styles.categoryTitle}>Early Intervention Services/Parent Education</Text>
              {renderExpandIcon('Early Intervention Services/Parent Education')}
            </View>
          </TouchableOpacity>
          {expandedSections['Early Intervention Services/Parent Education'] && (
            <>
              <ResourceLink name="MO First Steps" description="First Steps is Missouri's Early Intervention system that provides services to families with children, birth to three years of age, with disabilities or developmental delays. The program is designed to meet the needs of families related to enhancing their child's development, learning, and participation in family and community life." website="www.mofirststeps.com" phone="314-453-9205" />
              <ResourceLink name="Parents as Teachers" description="The Parents as Teachers approach is to partner, facilitate and reflect. These are parallel processes that occur at every level of our organization, from a Parent Educator visiting a family in their home all the way to the work of the National Center." website="www.parentsasteachers.org" phone="314-432-4330" />
            </>
          )}
        </View>

        <View style={styles.category}>
          <TouchableOpacity onPress={() => toggleSection('Parent Support Groups')}>
            <View style={styles.titleContainer}>
              <Text style={styles.categoryTitle}>Parent Support Groups</Text>
              {renderExpandIcon('Parent Support Groups')}
            </View>
          </TouchableOpacity>
          {expandedSections['Parent Support Groups'] && (
            <>
              <ResourceLink name="Missouri Family to Family" description="Missouri Family to Family is a family driven organization that can support you, as we do other families, by listening, training, and connecting you with quality resources specific to your situation. Think of us as your resource center." website="www.mofamilytofamily.org" phone="314-453-9205" />
              <ResourceLink name="MO-FEAT (Missouri Families for Effective Autism Treatment)" description="An organization of parents and professionals throughout Missouri with headquarters in St. Louis. Our mission is to provide advocacy, education, and support for families and the autism community and to support early diagnosis and effective autism treatment." website="www.mofeat.wordpress.com" phone="636-527-FEAT" />
            </>
          )}
        </View>

        <View style={styles.category}>
          <TouchableOpacity onPress={() => toggleSection('Respite Care')}>
            <View style={styles.titleContainer}>
              <Text style={styles.categoryTitle}>Respite Care</Text>
              {renderExpandIcon('Respite Care')}
            </View>
          </TouchableOpacity>
          {expandedSections['Respite Care'] && (
            <>
              <ResourceLink name="Community Living" description="Community Living works to enrich the lives of people with disabilities so they can achieve their highest potential. We do this by providing children and adults with services and programs to allow them to live, learn and work in our community. In turn, they make our community a more inclusive, diverse, and better place to live." website="www.communityliving.com" phone="636-970-2800" />
              <ResourceLink name="St. Louis ARC" description="Our mission is to empower people with intellectual and developmental disabilities and their families to lead better lives by providing a lifetime of high-quality services, family support and advocacy. We work hard to provide the kind of individualized services that can really help make a difference to an adult… to a child… to a family. Services provided are designed to maximize choice and to support people, as they build quality lives within the St. Louis community." website="www.slarc.org" phone="314-817-2216" />
            </>
          )}
        </View>

        <View style={styles.category}>
          <TouchableOpacity onPress={() => toggleSection('Self Advocacy')}>
            <View style={styles.titleContainer}>
              <Text style={styles.categoryTitle}>Self Advocacy</Text>
              {renderExpandIcon('Self Advocacy')}
            </View>
          </TouchableOpacity>
          {expandedSections['Self Advocacy'] && (
            <>
              <ResourceLink name="People First of Missouri" description="People First of Missouri is a self-advocacy organization that was formed by, is run by, and exists for people with developmental disabilities in the state of Missouri." website="www.missouripeoplefirst.org" phone="800-558-8653" />
              <ResourceLink name="MPACT" description="Empowering Families to advocate for themselves so that children with special education needs can reach their full potential in education and life." website="www.missouriparentsact.org" phone="800-743-7634" />
            </>
          )}
        </View>

        <View style={styles.category}>
          <TouchableOpacity onPress={() => toggleSection('Inclusion Services')}>
            <View style={styles.titleContainer}>
              <Text style={styles.categoryTitle}>Inclusion Services</Text>
              {renderExpandIcon('Inclusion Services')}
            </View>
          </TouchableOpacity>
          {expandedSections['Inclusion Services'] && (
            <>
              <ResourceLink name="United4Children" description="We believe that all children deserve a strong foundation to thrive regardless of race, zip code, or ability. We meet caregivers where they are, assess, train, coach, and support them with the knowledge and skills necessary to ensure that children feel safe, are nourished, and are nurtured with social-emotional and inclusive services. " website="www.united4children.org" phone="800-467-2322" />
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bodyContainer: {
    height: '100%',
    backgroundColor: 'white'
  },
  mainContentContainer: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 40,
    paddingBottom: 40,
    paddingTop: 10,
    backgroundColor: "white",
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    paddingBottom: 20,
    borderColor: COLORS.primaryColor
  },
  category: {
    marginBottom: 30
  },
});

export default Resources;
