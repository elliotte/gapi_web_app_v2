class PeoplesController < ApplicationController

	before_action :discover_api

	def index
    	# Get the list of people.
	    @response = $client.execute!(@plus.people.list,
	                                :collection => 'visible',
	                                :userId => 'me')
	    respond_to do |format|
	      	format.html
	      	format.js { @peoples = @response.data }
	    end
	    # render json: JSON.parse(@response).to_json
	end

	def show
	    # Get a person's profile.
	    response = $client.execute!(@plus.people.get,
	                                :userId => params[:id]).body
	    render json: JSON.parse(response).to_json
	end
	
	def search
		# Search all public profiles.
		if params[:next_page_token].present?
		    response = $client.execute!(@plus.people.search,
		                                {'query' => params[:query],
		                                'maxResults' => 20,
		                                'pageToken' => params[:next_page_token]}).body
		else
			response = $client.execute!(@plus.people.search,
		                                {'query' => params[:query],
		                                'maxResults' => 20}).body
		end
	    render json: response.to_json
	end

	def list_by_activity
		# List all of the people in the specified collection for a particular activity.
		response = $client.execute!(@plus.people.list_by_activity,
								  {'activityId' => params[:activity_id],
								   'collection' => params[:collection]}).body
		
	    render json: JSON.parse(response).to_json
	end

	def monea_email_search
		# Search all emails in monea
		response = User.find(:all, :conditions => ["email LIKE ?", "#{params[:query]}%"])
	    render json: response
	end

	def add_people
		## used for add user by email inside tam page, move to circle?
		team = Circle.find(params[:circle_id])
		user = User.find_by(id: params[:user_id])
		person_g_id = user.google_id
		teamfiles = team.team_files
		team_member = TeamMember.find_by(circle_id: team.id, google_id: person_g_id) 
		files_shared = false
		
		if team_member.present?
			team_member
		else
			team_member = TeamMember.create(circle_id: team.id, google_id: person_g_id)
            if teamfiles.present?
            	Circle.share_team_files($client, user, teamfiles)
            end
        end

	    respond_to do |format|
	      	format.js { @team_member = team_member }
	    end

	end

	private

	def discover_api
		# Authorizing the client and constructing a Google+ service.
		@plus = $client.discovered_api('plus', 'v1')
	end
end
